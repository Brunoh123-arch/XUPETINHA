import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nao encontrado")
    process.exit(1)
  }

  console.log("Conectando ao Supabase...")
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const sqlContent = readFileSync(join(__dirname, "SETUP-NOVO-SUPABASE.sql"), "utf8")

  // Divide o SQL em statements individuais para execucao segura
  // Usa separacao por blocos DO $$ e statements normais
  const statements = splitSqlStatements(sqlContent)

  console.log(`Executando ${statements.length} statements SQL...`)

  let success = 0
  let errors = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim()
    if (!stmt || stmt.startsWith("--")) continue

    try {
      const { error } = await supabase.rpc("exec_sql", { sql: stmt }).single()
      if (error && !error.message.includes("already exists") && !error.message.includes("duplicate")) {
        // Tenta via REST direto para DDL
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ sql: stmt }),
        })
        if (!res.ok) {
          console.warn(`[${i + 1}/${statements.length}] Aviso: ${error.message.substring(0, 80)}`)
          errors++
        } else {
          success++
        }
      } else {
        success++
      }
    } catch (err) {
      console.warn(`[${i + 1}/${statements.length}] Erro: ${String(err).substring(0, 80)}`)
      errors++
    }
  }

  console.log(`\nConcluido! ${success} ok, ${errors} avisos`)
}

/**
 * Separa o SQL em statements individuais respeitando blocos DO $$ ... $$ e funcoes.
 */
function splitSqlStatements(sql) {
  const statements = []
  let current = ""
  let inDollarBlock = false
  let dollarTag = ""

  const lines = sql.split("\n")
  for (const line of lines) {
    // Detecta abertura de bloco $$ ou $BODY$ etc
    if (!inDollarBlock) {
      const dollarMatch = line.match(/\$([A-Za-z_]*)\$/)
      if (dollarMatch && line.includes("$$")) {
        inDollarBlock = true
        dollarTag = dollarMatch[0]
      }
    } else {
      // Detecta fechamento do bloco
      if (line.includes(dollarTag)) {
        inDollarBlock = false
      }
    }

    current += line + "\n"

    if (!inDollarBlock && line.trim().endsWith(";")) {
      const stmt = current.trim()
      if (stmt.length > 1) {
        statements.push(stmt)
      }
      current = ""
    }
  }

  if (current.trim()) {
    statements.push(current.trim())
  }

  return statements
}

main()
