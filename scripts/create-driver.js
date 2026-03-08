#!/usr/bin/env node

/**
 * Script para criar um usuário motorista no Supabase
 * Uso: node scripts/create-driver.js
 */

const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não estão definidas');
  process.exit(1);
}

// Credenciais do novo motorista
const driverEmail = 'motorista' + Math.random().toString(36).substring(7) + '@uppi.com';
const driverPassword = 'Motorista@123456';
const driverFullName = 'Teste Motorista';
const driverPhone = '(11) 99999-9999';

console.log('📝 Criando usuário motorista no Supabase...\n');

// Função para fazer requisição HTTPS
function makeRequest(method, path, body = null) {
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
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function createDriver() {
  try {
    // 1. Criar usuário no Auth
    console.log('1️⃣ Criando usuário no Auth...');
    const authResponse = await makeRequest(
      'POST',
      '/auth/v1/admin/users',
      {
        email: driverEmail,
        password: driverPassword,
        email_confirm: true,
        user_metadata: {
          full_name: driverFullName,
          phone: driverPhone,
        },
      }
    );

    if (authResponse.statusCode !== 201 && authResponse.statusCode !== 200) {
      console.error('❌ Erro ao criar usuário:', authResponse.body);
      process.exit(1);
    }

    const userId = authResponse.body.id;
    console.log(`✅ Usuário criado com ID: ${userId}\n`);

    // 2. Criar perfil do usuário
    console.log('2️⃣ Criando perfil do usuário...');
    const profileResponse = await makeRequest(
      'POST',
      '/rest/v1/profiles',
      {
        id: userId,
        email: driverEmail,
        full_name: driverFullName,
        phone: driverPhone,
        created_at: new Date().toISOString(),
      }
    );

    if (profileResponse.statusCode !== 201) {
      console.error('❌ Erro ao criar perfil:', profileResponse.body);
    } else {
      console.log('✅ Perfil criado com sucesso\n');
    }

    // 3. Criar registro de motorista
    console.log('3️⃣ Criando registro de motorista...');
    const driverResponse = await makeRequest(
      'POST',
      '/rest/v1/drivers',
      {
        user_id: userId,
        status: 'approved',
        license_number: 'ABC123456',
        license_category: 'D',
        cpf: '12345678900',
        background_check_status: 'approved',
        is_online: false,
        rating: 5,
        total_rides: 0,
        total_earnings: 0,
        availability: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    if (driverResponse.statusCode !== 201) {
      console.error('⚠️ Aviso ao criar registro de motorista:', driverResponse.body);
    } else {
      console.log('✅ Registro de motorista criado com sucesso\n');
    }

    // Exibir credenciais
    console.log('═══════════════════════════════════════════');
    console.log('✅ MOTORISTA CRIADO COM SUCESSO!\n');
    console.log('📧 Email: ' + driverEmail);
    console.log('🔑 Senha: ' + driverPassword);
    console.log('👤 Nome: ' + driverFullName);
    console.log('📱 Telefone: ' + driverPhone);
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createDriver();
