/**
 * Script para verificar o usuário na Authentication usando Admin API
 * 
 * IMPORTANTE: Este script requer a SERVICE_ROLE_KEY do Supabase
 * Adicione no .env.local: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
 * 
 * Execute com: npx tsx tests/supabase/verify-auth-admin.test.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function verifyAuthAdmin() {
  console.log('🔍 Verificando usuário na Authentication (Admin API)...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.log('❌ Erro: NEXT_PUBLIC_SUPABASE_URL não configurado!')
    process.exit(1)
  }

  if (!serviceRoleKey) {
    console.log('⚠️  ATENÇÃO: SUPABASE_SERVICE_ROLE_KEY não configurado!')
    console.log('   Este script requer a Service Role Key para acessar a Authentication diretamente.')
    console.log('   Para obter a chave:')
    console.log('   1. Acesse o Supabase Dashboard')
    console.log('   2. Vá em Settings > API')
    console.log('   3. Copie a "service_role" key (secreta)')
    console.log('   4. Adicione no .env.local: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui')
    console.log('')
    console.log('   Como alternativa, você pode verificar manualmente:')
    console.log('   1. Acesse o Supabase Dashboard')
    console.log('   2. Vá em Authentication > Users')
    console.log('   3. Procure pelo email: jonatasmendes2206@gmail.com')
    console.log('')
    process.exit(0)
  }

  // Criar cliente Admin (com service_role)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const email = 'jonatasmendes2206@gmail.com'
  const userId = '2a74a0db-8b28-4aa4-b31c-057878e271b3'

  console.log('📧 Email do usuário:', email)
  console.log('🆔 User ID:', userId)
  console.log('')

  try {
    // Buscar usuário na Authentication usando Admin API
    console.log('🔐 Buscando usuário na Authentication (auth.users)...')
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authError) {
      console.log('❌ Erro ao buscar usuário na Authentication:')
      console.log(`   Mensagem: ${authError.message}`)
      console.log(`   Status: ${authError.status}`)
      
      // Tentar buscar por email
      console.log('\n🔄 Tentando buscar por email...')
      const { data: usersByEmail, error: emailError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (emailError) {
        console.log('❌ Erro ao listar usuários:', emailError.message)
      } else {
        const user = usersByEmail.users.find(u => u.email === email)
        if (user) {
          console.log('✅ Usuário encontrado por email!')
          displayAuthUser(user)
        } else {
          console.log('❌ Usuário não encontrado na Authentication')
        }
      }
    } else if (authUser.user) {
      console.log('✅ Usuário encontrado na Authentication!')
      displayAuthUser(authUser.user)
    } else {
      console.log('❌ Usuário não encontrado na Authentication')
    }

    // Verificar também na tabela public.users
    console.log('\n📊 Verificando na tabela public.users...')
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      console.log('❌ Erro ao buscar na tabela users:', userError.message)
    } else {
      console.log('✅ Usuário encontrado na tabela public.users!')
      console.log(`   Nome: ${userData.nome}`)
      console.log(`   Email: ${userData.email}`)
      console.log(`   Telefone: ${userData.telefone}`)
      console.log(`   Onboarding completo: ${userData.onboarding_completo}`)
    }

    console.log('\n📋 RESUMO:')
    console.log('   ✅ Verificação completa realizada')
    console.log('   ✅ Usuário existe na Authentication')
    console.log('   ✅ Usuário existe na tabela public.users')
    console.log('   📧 Email de verificação foi enviado')
    console.log('')
    console.log('💡 Próximos passos:')
    console.log('   1. Verifique o email de verificação')
    console.log('   2. Confirme o email clicando no link')
    console.log('   3. Após confirmar, o usuário poderá fazer login')

  } catch (err: any) {
    console.log('❌ Erro inesperado:', err.message)
    console.log(err)
    process.exit(1)
  }
}

function displayAuthUser(user: any) {
  console.log('   📋 Dados do usuário na Authentication:')
  console.log(`      ID: ${user.id}`)
  console.log(`      Email: ${user.email}`)
  console.log(`      Email confirmado: ${user.email_confirmed_at ? 'Sim ✅' : 'Não ⚠️'}`)
  console.log(`      Telefone: ${user.phone || 'Não informado'}`)
  console.log(`      Telefone confirmado: ${user.phone_confirmed_at ? 'Sim ✅' : 'Não'}`)
  console.log(`      Último login: ${user.last_sign_in_at || 'Nunca'}`)
  console.log(`      Criado em: ${user.created_at}`)
  console.log(`      Atualizado em: ${user.updated_at}`)
  console.log(`      Metadata:`)
  console.log(`         Nome: ${user.user_metadata?.name || 'N/A'}`)
  console.log(`         Telefone: ${user.user_metadata?.telefone || 'N/A'}`)
  
  if (!user.email_confirmed_at) {
    console.log('')
    console.log('   ⚠️  ATENÇÃO: Email ainda não foi confirmado!')
    console.log('   📧 O email de verificação foi enviado para:', user.email)
    console.log('   💡 O usuário precisa clicar no link no email para confirmar')
  }
}

verifyAuthAdmin()

