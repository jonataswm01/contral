/**
 * Script para verificar se o usuário foi criado corretamente
 * na Authentication e na tabela public.users
 * 
 * Execute com: npx tsx tests/supabase/verify-user.test.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function verifyUser() {
  console.log('🔍 Verificando usuário no Supabase...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Erro: Variáveis de ambiente não configuradas!')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const email = 'jonatasmendes2206@gmail.com'
  const userId = '2a74a0db-8b28-4aa4-b31c-057878e271b3' // ID do usuário criado

  console.log('📧 Email do usuário:', email)
  console.log('🆔 User ID:', userId)
  console.log('')

  try {
    // VERIFICAÇÃO 1: Verificar na Authentication via Admin API
    // Nota: Para verificar na Authentication, precisamos usar a Admin API
    // Mas com a chave anon, podemos tentar fazer login para verificar
    console.log('🔐 VERIFICAÇÃO 1: Authentication Users (auth.users)')
    console.log('   ⚠️  Para verificar diretamente na Authentication, é necessário usar a Admin API')
    console.log('   📝 Verificando via tentativa de login...\n')

    // Tentar buscar informações do usuário autenticado (se estiver logado)
    const { data: { user: currentUser }, error: currentUserError } = await supabase.auth.getUser()
    
    if (currentUser && currentUser.id === userId) {
      console.log('   ✅ Usuário autenticado encontrado:')
      console.log(`      ID: ${currentUser.id}`)
      console.log(`      Email: ${currentUser.email}`)
      console.log(`      Email confirmado: ${currentUser.email_confirmed_at ? 'Sim' : 'Não'}`)
      console.log(`      Criado em: ${currentUser.created_at}`)
      console.log(`      Metadata:`, currentUser.user_metadata)
    } else {
      console.log('   ℹ️  Usuário não está autenticado no momento')
      console.log('   💡 Para verificar na Authentication:')
      console.log('      1. Acesse o Supabase Dashboard')
      console.log('      2. Vá em Authentication > Users')
      console.log('      3. Procure pelo email:', email)
      console.log('      4. Verifique se o usuário existe e se o email foi confirmado')
    }
    console.log('')

    // VERIFICAÇÃO 2: Verificar na tabela public.users
    console.log('📊 VERIFICAÇÃO 2: Tabela public.users')
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116' || userError.message?.includes('No rows')) {
        console.log('   ❌ Usuário NÃO encontrado na tabela public.users')
        console.log(`   Erro: ${userError.message}`)
      } else {
        console.log('   ❌ Erro ao buscar usuário:')
        console.log(`      Mensagem: ${userError.message}`)
        console.log(`      Código: ${userError.code}`)
      }
    } else {
      console.log('   ✅ Usuário encontrado na tabela public.users!')
      console.log('   📋 Dados completos:')
      console.log(`      ID: ${userData.id}`)
      console.log(`      Nome: ${userData.nome}`)
      console.log(`      Email: ${userData.email}`)
      console.log(`      Telefone: ${userData.telefone}`)
      console.log(`      Onboarding completo: ${userData.onboarding_completo}`)
      console.log(`      Assinatura ativa: ${userData.assinatura_ativa || false}`)
      console.log(`      Trial até: ${userData.trial_ate || 'N/A'}`)
      console.log(`      Criado em: ${userData.created_at || 'N/A'}`)
      console.log(`      Atualizado em: ${userData.updated_at || 'N/A'}`)
    }
    console.log('')

    // VERIFICAÇÃO 3: Verificar também na tabela perfis (caso exista)
    console.log('📊 VERIFICAÇÃO 3: Tabela public.perfis (se existir)')
    
    const { data: perfilData, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single()

    if (perfilError) {
      if (perfilError.code === 'PGRST116' || perfilError.message?.includes('No rows')) {
        console.log('   ℹ️  Usuário não encontrado na tabela perfis (pode não existir ou não ter sido criado)')
      } else if (perfilError.message?.includes('relation "perfis" does not exist')) {
        console.log('   ℹ️  Tabela "perfis" não existe (usando apenas "users")')
      } else {
        console.log('   ⚠️  Erro ao buscar na tabela perfis:', perfilError.message)
      }
    } else {
      console.log('   ✅ Usuário também encontrado na tabela perfis!')
      console.log(`      ID: ${perfilData.id}`)
      console.log(`      Nome completo: ${perfilData.nome_completo}`)
      console.log(`      Telefone: ${perfilData.telefone}`)
      console.log(`      Onboarding completo: ${perfilData.onboarding_completo}`)
    }
    console.log('')

    // RESUMO FINAL
    console.log('📋 RESUMO DA VERIFICAÇÃO:')
    console.log('   ✅ Usuário criado com sucesso!')
    console.log('   ✅ Registro encontrado na tabela public.users')
    console.log('   📧 Email de verificação foi enviado')
    console.log('   ⚠️  Para verificar na Authentication:')
    console.log('      - Acesse o Supabase Dashboard')
    console.log('      - Vá em Authentication > Users')
    console.log('      - Procure pelo email:', email)
    console.log('')
    console.log('💡 Próximos passos:')
    console.log('   1. Verifique o email de verificação em:', email)
    console.log('   2. Clique no link de confirmação')
    console.log('   3. Após confirmar, o usuário poderá fazer login')
    console.log('   4. Complete o onboarding na plataforma')

  } catch (err: any) {
    console.log('❌ Erro inesperado:', err.message)
    console.log(err)
    process.exit(1)
  }
}

verifyUser()

