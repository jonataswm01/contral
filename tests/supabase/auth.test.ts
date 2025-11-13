/**
 * Teste de autenticação no Supabase
 * 
 * Execute com: npx tsx tests/supabase/auth.test.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testAuth() {
  console.log('🔍 Testando autenticação no Supabase...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Erro: Variáveis de ambiente não configuradas!')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Testar cadastro
  const testEmail = `test.${Date.now()}@test.com`
  const testPassword = 'Teste123456!'
  const testName = 'Usuário Teste'

  console.log('👤 Testando cadastro de usuário...')
  console.log(`   Email: ${testEmail}\n`)

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
        },
      },
    })

    if (error) {
      console.log('❌ Erro ao cadastrar:', error.message)
      process.exit(1)
    }

    if (data.user) {
      console.log('✅ Usuário cadastrado com sucesso!')
      console.log(`   ID: ${data.user.id}`)
      console.log(`   Email: ${data.user.email}`)
      console.log(`   Verificação necessária: ${data.user.email_confirmed_at ? 'Não' : 'Sim'}\n`)

      // Testar login
      console.log('🔐 Testando login...')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (loginError) {
        console.log('❌ Erro ao fazer login:', loginError.message)
        process.exit(1)
      }

      if (loginData.user) {
        console.log('✅ Login realizado com sucesso!')
        console.log(`   ID: ${loginData.user.id}`)
        console.log(`   Email: ${loginData.user.email}\n`)
      }

      // Testar logout
      console.log('🚪 Testando logout...')
      const { error: logoutError } = await supabase.auth.signOut()

      if (logoutError) {
        console.log('❌ Erro ao fazer logout:', logoutError.message)
      } else {
        console.log('✅ Logout realizado com sucesso!\n')
      }

      console.log('🎉 Teste de autenticação concluído!')
    }
  } catch (err: any) {
    console.log('❌ Erro inesperado:', err.message)
    process.exit(1)
  }
}

testAuth()

