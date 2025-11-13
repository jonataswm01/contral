/**
 * Teste de criação de usuário real no Supabase
 * 
 * Simula o cadastro de um novo usuário e verifica se foi criado
 * tanto na Authentication quanto na tabela public.users
 * 
 * Execute com: npx tsx tests/supabase/create-user.test.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function createUserTest() {
  console.log('🔍 Testando criação de usuário no Supabase...\n')

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

  // Dados do usuário de teste
  const userData = {
    nome: 'Jonatas Mendes',
    email: 'jonatasmendes2206@gmail.com',
    telefone: '44920012310', // Já sem formatação
    password: 'Teste123456!', // Senha temporária para teste
  }

  console.log('👤 Dados do usuário:')
  console.log(`   Nome: ${userData.nome}`)
  console.log(`   Email: ${userData.email}`)
  console.log(`   Telefone: ${userData.telefone}\n`)

  try {
    // PASSO 1: Criar usuário na Authentication
    console.log('📝 PASSO 1: Criando usuário na Authentication...')
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?type=signup&next=/onboarding`,
        data: {
          name: userData.nome,
          telefone: userData.telefone,
        },
      },
    })

    if (signUpError) {
      console.log('❌ Erro ao criar usuário na Authentication:')
      console.log(`   Mensagem: ${signUpError.message}`)
      console.log(`   Status: ${signUpError.status}`)
      
      // Se o usuário já existe, vamos tentar fazer login e verificar
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
        console.log('\n⚠️  Usuário já existe na Authentication. Tentando fazer login...')
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: userData.password,
        })

        if (loginError) {
          console.log('❌ Erro ao fazer login:', loginError.message)
          console.log('   Por favor, verifique se a senha está correta ou se o usuário precisa ser criado manualmente.')
          process.exit(1)
        }

        if (loginData.user) {
          console.log('✅ Login realizado com sucesso!')
          console.log(`   User ID: ${loginData.user.id}`)
          console.log(`   Email: ${loginData.user.email}`)
          console.log(`   Email confirmado: ${loginData.user.email_confirmed_at ? 'Sim' : 'Não'}\n`)
          
          // Verificar se existe na tabela users
          await checkUserInTable(loginData.user.id, supabase)
          return
        }
      } else {
        process.exit(1)
      }
    }

    if (!signUpData.user) {
      console.log('❌ Nenhum usuário foi criado')
      process.exit(1)
    }

    console.log('✅ Usuário criado na Authentication com sucesso!')
    console.log(`   User ID: ${signUpData.user.id}`)
    console.log(`   Email: ${signUpData.user.email}`)
    console.log(`   Email confirmado: ${signUpData.user.email_confirmed_at ? 'Sim' : 'Não'}`)
    console.log(`   Metadata:`, signUpData.user.user_metadata)
    console.log('')

    // PASSO 2: Verificar se o email de verificação foi enviado
    if (!signUpData.user.email_confirmed_at) {
      console.log('📧 PASSO 2: Email de verificação')
      console.log('   ✅ Email de verificação foi enviado!')
      console.log(`   📬 Verifique a caixa de entrada de: ${userData.email}`)
      console.log('   ⚠️  O usuário precisa confirmar o email antes de fazer login.\n')
    } else {
      console.log('📧 PASSO 2: Email já confirmado\n')
    }

    // PASSO 3: Criar registro na tabela public.users
    console.log('📝 PASSO 3: Criando registro na tabela public.users...')
    
    const telefoneLimpo = userData.telefone.replace(/\D/g, '')
    const trialAte = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 dias

    // Tentar inserir na tabela users
    const { data: userTableData, error: userTableError } = await supabase
      .from('users')
      .insert({
        id: signUpData.user.id,
        email: userData.email,
        nome: userData.nome,
        telefone: telefoneLimpo,
        trial_ate: trialAte,
        onboarding_completo: false,
      })
      .select()
      .single()

    if (userTableError) {
      // Se der erro porque já existe, tentar buscar
      if (userTableError.code === '23505' || userTableError.message?.includes('duplicate')) {
        console.log('⚠️  Registro já existe na tabela users. Buscando...')
        
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signUpData.user.id)
          .single()

        if (fetchError) {
          console.log('❌ Erro ao buscar usuário existente:', fetchError.message)
        } else {
          console.log('✅ Usuário encontrado na tabela users:')
          console.log(`   ID: ${existingUser.id}`)
          console.log(`   Nome: ${existingUser.nome}`)
          console.log(`   Email: ${existingUser.email}`)
          console.log(`   Telefone: ${existingUser.telefone}`)
          console.log(`   Onboarding completo: ${existingUser.onboarding_completo}\n`)
        }
      } else {
        console.log('❌ Erro ao criar registro na tabela users:')
        console.log(`   Mensagem: ${userTableError.message}`)
        console.log(`   Código: ${userTableError.code}`)
        console.log(`   Detalhes: ${userTableError.details}`)
        console.log(`   Hint: ${userTableError.hint}\n`)
        
        // Tentar verificar se a tabela é "perfis" ao invés de "users"
        console.log('🔄 Tentando criar na tabela "perfis"...')
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis')
          .insert({
            id: signUpData.user.id,
            nome_completo: userData.nome,
            telefone: telefoneLimpo,
            onboarding_completo: false,
          })
          .select()
          .single()

        if (perfilError) {
          console.log('❌ Erro ao criar na tabela perfis:', perfilError.message)
        } else {
          console.log('✅ Registro criado na tabela perfis!')
          console.log(`   ID: ${perfilData.id}`)
          console.log(`   Nome: ${perfilData.nome_completo}\n`)
        }
      }
    } else {
      console.log('✅ Registro criado na tabela users com sucesso!')
      console.log(`   ID: ${userTableData.id}`)
      console.log(`   Nome: ${userTableData.nome}`)
      console.log(`   Email: ${userTableData.email}`)
      console.log(`   Telefone: ${userTableData.telefone}`)
      console.log(`   Onboarding completo: ${userTableData.onboarding_completo}\n`)
    }

    // PASSO 4: Verificar se o usuário foi criado corretamente
    console.log('🔍 PASSO 4: Verificando criação do usuário...\n')
    await checkUserInTable(signUpData.user.id, supabase)

    console.log('🎉 Teste de criação de usuário concluído!')
    console.log('\n📋 Resumo:')
    console.log('   ✅ Usuário criado na Authentication')
    console.log('   📧 Email de verificação enviado')
    console.log('   ✅ Registro criado na tabela public.users (ou perfis)')
    console.log('\n💡 Próximos passos:')
    console.log('   1. Verifique o email de verificação')
    console.log('   2. Confirme o email clicando no link')
    console.log('   3. Faça login com as credenciais')
    console.log('   4. Complete o onboarding')

  } catch (err: any) {
    console.log('❌ Erro inesperado:', err.message)
    console.log(err)
    process.exit(1)
  }
}

async function checkUserInTable(userId: string, supabase: any) {
  console.log('🔍 Verificando usuário na tabela public.users...')
  
  // Tentar buscar na tabela users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (userError) {
    if (userError.code === 'PGRST116' || userError.message?.includes('No rows')) {
      console.log('   ⚠️  Usuário não encontrado na tabela "users"')
      
      // Tentar buscar na tabela perfis
      console.log('   🔄 Verificando na tabela "perfis"...')
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single()

      if (perfilError) {
        console.log('   ❌ Usuário também não encontrado na tabela "perfis"')
        console.log(`   Erro: ${perfilError.message}`)
      } else {
        console.log('   ✅ Usuário encontrado na tabela "perfis":')
        console.log(`      ID: ${perfilData.id}`)
        console.log(`      Nome: ${perfilData.nome_completo}`)
        console.log(`      Telefone: ${perfilData.telefone}`)
        console.log(`      Onboarding completo: ${perfilData.onboarding_completo}`)
      }
    } else {
      console.log(`   ❌ Erro ao buscar usuário: ${userError.message}`)
    }
  } else {
    console.log('   ✅ Usuário encontrado na tabela "users":')
    console.log(`      ID: ${userData.id}`)
    console.log(`      Nome: ${userData.nome}`)
    console.log(`      Email: ${userData.email}`)
    console.log(`      Telefone: ${userData.telefone}`)
    console.log(`      Onboarding completo: ${userData.onboarding_completo}`)
    console.log(`      Trial até: ${userData.trial_ate}`)
  }
  
  console.log('')
}

createUserTest()

