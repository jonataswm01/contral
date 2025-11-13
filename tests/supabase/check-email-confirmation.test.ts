/**
 * Script para verificar se o email foi confirmado
 * Tenta fazer login para verificar o status de confirmação
 * 
 * Execute com: npx tsx tests/supabase/check-email-confirmation.test.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function checkEmailConfirmation() {
  console.log('🔍 Verificando confirmação de email...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Erro: Variáveis de ambiente não configuradas!')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const email = 'jonatasmendes2206@gmail.com'
  const password = 'Teste123456!'

  console.log('📧 Email:', email)
  console.log('')

  try {
    // Tentar fazer login para verificar se o email foi confirmado
    console.log('🔐 Tentando fazer login para verificar confirmação...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      console.log('❌ Erro ao fazer login:')
      console.log(`   Mensagem: ${loginError.message}`)
      console.log(`   Status: ${loginError.status}`)
      
      if (loginError.message.includes('Email not confirmed') || loginError.message.includes('email not confirmed')) {
        console.log('')
        console.log('⚠️  STATUS: Email AINDA NÃO foi confirmado!')
        console.log('   O usuário precisa clicar no link de confirmação no email.')
      } else if (loginError.message.includes('Invalid login credentials')) {
        console.log('')
        console.log('⚠️  Erro: Credenciais inválidas')
        console.log('   Isso pode significar que:')
        console.log('   - A senha está incorreta, OU')
        console.log('   - O email ainda não foi confirmado')
      } else {
        console.log('')
        console.log('⚠️  Erro desconhecido ao fazer login')
      }
    } else if (loginData.user) {
      console.log('✅ Login realizado com sucesso!')
      console.log('')
      console.log('📋 Informações do usuário autenticado:')
      console.log(`   ID: ${loginData.user.id}`)
      console.log(`   Email: ${loginData.user.email}`)
      console.log(`   Email confirmado: ${loginData.user.email_confirmed_at ? 'Sim ✅' : 'Não ⚠️'}`)
      
      if (loginData.user.email_confirmed_at) {
        console.log(`   Data de confirmação: ${new Date(loginData.user.email_confirmed_at).toLocaleString('pt-BR')}`)
        console.log('')
        console.log('🎉 SUCESSO! O email foi confirmado com sucesso!')
      } else {
        console.log('')
        console.log('⚠️  ATENÇÃO: Email ainda não foi confirmado')
        console.log('   Mas o login funcionou (pode ser que o Supabase esteja configurado para permitir login sem confirmação)')
      }
      
      console.log(`   Último login: ${loginData.user.last_sign_in_at ? new Date(loginData.user.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca'}`)
      console.log(`   Criado em: ${new Date(loginData.user.created_at).toLocaleString('pt-BR')}`)
      console.log(`   Metadata:`)
      console.log(`      Nome: ${loginData.user.user_metadata?.name || 'N/A'}`)
      console.log(`      Telefone: ${loginData.user.user_metadata?.telefone || 'N/A'}`)
      console.log('')

      // Verificar também na tabela users
      console.log('📊 Verificando na tabela public.users...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', loginData.user.id)
        .single()

      if (userError) {
        console.log('⚠️  Erro ao buscar na tabela users:', userError.message)
      } else {
        console.log('✅ Dados na tabela users:')
        console.log(`   Nome: ${userData.nome}`)
        console.log(`   Email: ${userData.email}`)
        console.log(`   Telefone: ${userData.telefone}`)
        console.log(`   Onboarding completo: ${userData.onboarding_completo ? 'Sim ✅' : 'Não ⚠️'}`)
        console.log(`   Criado em: ${new Date(userData.created_at).toLocaleString('pt-BR')}`)
        console.log(`   Atualizado em: ${new Date(userData.updated_at).toLocaleString('pt-BR')}`)
      }

      // Fazer logout
      await supabase.auth.signOut()
      console.log('')
      console.log('🚪 Logout realizado')
    }

    console.log('')
    console.log('📋 RESUMO:')
    if (loginData?.user?.email_confirmed_at) {
      console.log('   ✅ Email CONFIRMADO com sucesso!')
      console.log('   ✅ Usuário pode fazer login normalmente')
      console.log('   ✅ Pronto para usar a plataforma')
    } else if (loginData?.user) {
      console.log('   ⚠️  Login funcionou, mas email pode não estar confirmado')
      console.log('   ✅ Usuário pode fazer login')
    } else {
      console.log('   ⚠️  Email ainda não confirmado ou credenciais inválidas')
      console.log('   📧 Verifique o email de confirmação')
    }

  } catch (err: any) {
    console.log('❌ Erro inesperado:', err.message)
    console.log(err)
    process.exit(1)
  }
}

checkEmailConfirmation()

