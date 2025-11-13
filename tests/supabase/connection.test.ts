/**
 * Teste de conexão com Supabase
 * 
 * Execute com: npx tsx tests/supabase/connection.test.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Erro: Variáveis de ambiente não configuradas!')
    console.log('   Certifique-se de que o arquivo .env.local existe e contém:')
    console.log('   - NEXT_PUBLIC_SUPABASE_URL')
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  console.log('✅ Variáveis de ambiente encontradas')
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...\n`)

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Testar conexão básica
    console.log('🔌 Testando conexão...')
    const { data, error } = await supabase.from('users').select('count').limit(1)

    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('⚠️  A tabela "users" não existe ainda.')
        console.log('   Execute o schema.sql no Supabase SQL Editor.')
        console.log('   ✅ Mas a conexão com o Supabase está funcionando!')
      } else {
        console.log('❌ Erro ao conectar:', error.message)
        process.exit(1)
      }
    } else {
      console.log('✅ Conexão com Supabase funcionando perfeitamente!')
    }
  } catch (err: any) {
    console.log('❌ Erro inesperado:', err.message)
    process.exit(1)
  }
}

testConnection()

