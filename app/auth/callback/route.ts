import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/login?error=config', requestUrl.origin))
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
        },
      },
    })

    // Trocar o código por uma sessão
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Erro ao trocar código por sessão:', error)
      return NextResponse.redirect(new URL('/login?error=verification_failed', requestUrl.origin))
    }

    // Verificar se o email foi confirmado
    const { data: { user } } = await supabase.auth.getUser()

    if (user && user.email_confirmed_at) {
      // Email confirmado com sucesso
      // Garantir que o perfil existe (caso o trigger não tenha funcionado)
      if (type === 'signup') {
        try {
          // Verificar se o registro já existe na tabela users
          const { data: userExistente } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single()

          // Se não existe, criar
          if (!userExistente) {
            const nome = user.user_metadata?.name || 'Usuário'
            const telefone = user.user_metadata?.telefone || null
            
            // A tabela users requer email e telefone como NOT NULL
            const telefoneFinal = telefone || `temp_${user.id.substring(0, 8)}`
            
            const { error: userError } = await supabase.from('users').insert({
              id: user.id,
              email: user.email || '', // Campo obrigatório
              nome: nome,
              telefone: telefoneFinal, // Campo obrigatório e UNIQUE
              trial_ate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              onboarding_completo: false, // Importante: garantir que começa como false
            })

            if (userError) {
              console.error('Erro ao criar registro em users no callback:', userError)
            } else {
              console.log('✅ Registro criado no callback com sucesso')
            }
          }
        } catch (err) {
          console.error('Erro ao verificar/criar perfil no callback:', err)
        }
      }

      // Redirecionar para a página especificada (ou onboarding se for signup)
      if (type === 'signup') {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } else {
      // Email ainda não confirmado (não deveria acontecer, mas por segurança)
      return NextResponse.redirect(new URL('/verificar-email', requestUrl.origin))
    }
  }

  // Se não houver código, redirecionar para login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}

