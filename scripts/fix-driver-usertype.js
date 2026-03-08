#!/usr/bin/env node

/**
 * Script para corrigir o user_type do motorista existente
 */

const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erro: variaveis de ambiente nao definidas');
  process.exit(1);
}

const driverEmail = 'motorista@uppi.com';

function makeRequest(method, path, body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        ...extraHeaders,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // 1. Buscar o user ID pelo email via Admin API
  console.log('Buscando usuario motorista@uppi.com...');
  const listRes = await makeRequest('GET', '/auth/v1/admin/users?email=' + encodeURIComponent(driverEmail));
  
  console.log('Status busca:', listRes.statusCode);
  
  const users = listRes.body?.users || (Array.isArray(listRes.body) ? listRes.body : []);
  const user = users.find(u => u.email === driverEmail);

  if (!user) {
    console.error('Usuario nao encontrado. Body:', JSON.stringify(listRes.body));
    process.exit(1);
  }

  const userId = user.id;
  console.log('Usuario encontrado, ID:', userId);

  // 2. Tentar atualizar o perfil existente
  console.log('Atualizando user_type para driver...');
  const updateRes = await makeRequest(
    'PATCH',
    `/rest/v1/profiles?id=eq.${userId}`,
    { user_type: 'driver' },
    { 'Prefer': 'return=representation' }
  );

  console.log('Status update:', updateRes.statusCode);
  console.log('Body:', JSON.stringify(updateRes.body));

  if (updateRes.statusCode === 200 || updateRes.statusCode === 204) {
    console.log('Perfil atualizado com sucesso!');
  } else {
    // Perfil pode nao existir, tentar criar
    console.log('Tentando criar perfil...');
    const insertRes = await makeRequest(
      'POST',
      '/rest/v1/profiles',
      {
        id: userId,
        email: driverEmail,
        full_name: 'Teste Motorista',
        phone: '(11) 99999-9999',
        user_type: 'driver',
        created_at: new Date().toISOString(),
      },
      { 'Prefer': 'return=representation' }
    );
    console.log('Status insert:', insertRes.statusCode);
    console.log('Body:', JSON.stringify(insertRes.body));
  }

  console.log('\n========================================');
  console.log('CREDENCIAIS DO MOTORISTA:');
  console.log('Email: motorista@uppi.com');
  console.log('Senha: Motorista@123456');
  console.log('========================================\n');
}

main().catch(console.error);
