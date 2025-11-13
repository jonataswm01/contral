"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const supabase = createClient()

  // Verificar se há parâmetro redirect na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const redirect = urlParams.get('redirect')
    if (redirect) {
      console.log('🔍 [Login] Parâmetro redirect encontrado:', redirect)
      setDebugInfo(prev => [...prev, `Redirect detectado: ${redirect}`])
    }
  }, [])

  // Validação em tempo real
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailValid = email === "" || emailRegex.test(email)

  const getErrorMessage = (error: any): string => {
    if (!error) return "Ocorreu um erro inesperado. Tente novamente."
    
    const errorCode = error.code || error.message
    
    if (errorCode.includes("invalid_credentials") || errorCode.includes("invalid_grant")) {
      return "Email ou senha incorretos. Verifique e tente novamente."
    }
    
    if (errorCode.includes("email_not_confirmed") || errorCode.includes("email_not_verified")) {
      return "Seu email ainda não foi verificado. Verifique sua caixa de entrada."
    }
    
    if (errorCode.includes("too_many_requests")) {
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente."
    }
    
    if (errorCode.includes("email_address_invalid") || errorCode.includes("invalid_email")) {
      return "Por favor, verifique o formato do email."
    }
    
    return error.message || "Ocorreu um erro. Tente novamente."
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDebugInfo([])

    const addDebugInfo = (info: string) => {
      console.log(`🔍 [Login Debug] ${info}`)
      setDebugInfo(prev => [...prev, info])
    }

    addDebugInfo('Iniciando processo de login...')

    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    addDebugInfo(`Supabase URL configurado: ${supabaseUrl ? 'Sim' : 'Não'}`)
    addDebugInfo(`Supabase Key configurado: ${supabaseAnonKey ? 'Sim' : 'Não'}`)

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      const errorMsg = "Ops! Parece que há um problema de configuração. Entre em contato com o suporte."
      setError(errorMsg)
      addDebugInfo(`ERRO: ${errorMsg}`)
      setLoading(false)
      return
    }

    // Validação de email
    if (!emailValid) {
      const errorMsg = "Por favor, verifique o formato do email."
      setError(errorMsg)
      addDebugInfo(`ERRO: ${errorMsg}`)
      setLoading(false)
      return
    }

    addDebugInfo(`Email validado: ${email}`)
    addDebugInfo('Tentando fazer login com Supabase...')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        const errorMsg = getErrorMessage(signInError)
        addDebugInfo(`ERRO no signIn: ${signInError.message}`)
        addDebugInfo(`Código do erro: ${signInError.status || 'N/A'}`)
        addDebugInfo(`Detalhes: ${JSON.stringify(signInError)}`)
        setError(`${errorMsg} (Código: ${signInError.status || 'N/A'})`)
        setLoading(false)
        return
      }

      addDebugInfo('Login com Supabase realizado com sucesso!')

      if (data.user) {
        addDebugInfo(`User ID: ${data.user.id}`)
        addDebugInfo(`Email: ${data.user.email}`)
        addDebugInfo(`Email confirmado: ${data.user.email_confirmed_at ? 'Sim' : 'Não'}`)

        // Verificar se o email foi confirmado
        if (!data.user.email_confirmed_at) {
          const errorMsg = "Seu email ainda não foi verificado. Verifique sua caixa de entrada e clique no link de confirmação."
          addDebugInfo(`ERRO: ${errorMsg}`)
          setError(errorMsg)
          setLoading(false)
          return
        }

        // Aguardar e verificar se a sessão está estabelecida
        addDebugInfo('Verificando se a sessão foi estabelecida...')
        let sessionEstablished = false
        let attempts = 0
        const maxAttempts = 10
        
        while (!sessionEstablished && attempts < maxAttempts) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          if (session) {
            sessionEstablished = true
            addDebugInfo(`✅ Sessão estabelecida após ${attempts + 1} tentativas`)
            addDebugInfo(`Token de acesso presente: ${session.access_token ? 'Sim' : 'Não'}`)
            addDebugInfo(`Token expira em: ${new Date(session.expires_at! * 1000).toLocaleString('pt-BR')}`)
          } else {
            attempts++
            if (sessionError) {
              addDebugInfo(`Tentativa ${attempts}: Erro ao obter sessão - ${sessionError.message}`)
            } else {
              addDebugInfo(`Tentativa ${attempts}: Sessão ainda não disponível`)
            }
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        }

        if (!sessionEstablished) {
          const errorMsg = `⚠️ Sessão não estabelecida após ${maxAttempts} tentativas`
          addDebugInfo(`ERRO: ${errorMsg}`)
          console.warn(errorMsg)
        }

        // Verificar se o onboarding foi completo
        try {
          console.log("🔍 Verificando onboarding para usuário:", data.user.id)
          console.log("🔑 User ID:", data.user.id)
          console.log("📧 Email:", data.user.email)
          
          // Verificar novamente se a sessão está ativa
          const { data: { session }, error: sessionCheckError } = await supabase.auth.getSession()
          addDebugInfo(`Sessão ativa antes de verificar onboarding: ${!!session}`)
          if (sessionCheckError) {
            addDebugInfo(`ERRO ao verificar sessão: ${sessionCheckError.message}`)
          }
          if (!session) {
            addDebugInfo('⚠️ ATENÇÃO: Sessão não encontrada antes de verificar onboarding!')
          }
          
          // PRIMEIRO: Verificar user_metadata (mais confiável, não depende de RLS)
          const onboardingCompletoMetadata = data.user.user_metadata?.onboarding_completo
          console.log("📋 Onboarding completo (metadata):", onboardingCompletoMetadata)
          
          if (onboardingCompletoMetadata === true) {
            console.log("✅ Onboarding completo (via metadata), redirecionando para /dashboard")
            setLoading(false)
            await new Promise(resolve => setTimeout(resolve, 300))
            router.push("/dashboard")
            return
          }
          
          // SEGUNDO: Se não estiver no metadata, verificar na tabela users
          const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("onboarding_completo")
            .eq("id", data.user.id)
            .single()

          console.log("📊 Resultado da query:", { 
            userProfile, 
            profileError,
            errorCode: profileError?.code,
            errorMessage: profileError?.message,
            errorDetails: profileError?.details,
            errorHint: profileError?.hint
          })

          if (profileError) {
            const errorDetails = {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint
            }
            addDebugInfo(`❌ ERRO ao buscar perfil: ${profileError.message}`)
            addDebugInfo(`Código: ${profileError.code || 'N/A'}`)
            addDebugInfo(`Detalhes: ${JSON.stringify(errorDetails)}`)
            console.error("❌ Erro ao buscar perfil:", profileError)
            console.error("📋 Detalhes do erro:", errorDetails)
            
            // Verificar se é erro de RLS (permissão)
            if (profileError.code === '42501' || profileError.message?.includes('permission denied') || profileError.message?.includes('row-level security')) {
              const errorMsg = "Erro de permissão. Verifique as políticas RLS da tabela users no Supabase."
              addDebugInfo(`🔒 ERRO DE PERMISSÃO (RLS): ${errorMsg}`)
              console.error("🔒 ERRO DE PERMISSÃO (RLS): A tabela users está bloqueada por RLS")
              setError(`${errorMsg} (Código: ${profileError.code})`)
              setLoading(false)
              return
            }
            
            // Se o erro for porque o usuário não existe na tabela users, criar o registro
            if (profileError.code === 'PGRST116' || profileError.message?.includes('No rows') || profileError.message?.includes('not found')) {
              addDebugInfo("⚠️ Usuário não existe na tabela users, tentando criar registro...")
              console.log("⚠️ Usuário não existe na tabela users, tentando criar registro...")
              
              const { data: newUser, error: createError } = await supabase.from("users").insert({
                id: data.user.id,
                email: data.user.email || '',
                nome: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
                telefone: data.user.user_metadata?.telefone || `temp_${data.user.id.substring(0, 8)}`,
                onboarding_completo: false,
                trial_ate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              }).select().single()

              if (createError) {
                addDebugInfo(`❌ ERRO ao criar registro: ${createError.message}`)
                addDebugInfo(`Código: ${createError.code || 'N/A'}`)
                console.error("❌ Erro ao criar registro:", createError)
                console.error("📋 Detalhes:", {
                  code: createError.code,
                  message: createError.message,
                  details: createError.details
                })
                
                // Se for erro de permissão ao criar, mostrar erro
                if (createError.code === '42501' || createError.message?.includes('permission denied')) {
                  const errorMsg = "Erro de permissão ao criar perfil. Verifique as políticas RLS no Supabase."
                  addDebugInfo(`🔒 ERRO DE PERMISSÃO: ${errorMsg}`)
                  setError(`${errorMsg} (Código: ${createError.code})`)
                  setLoading(false)
                  return
                }
                
                // Outros erros, assumir que não completou onboarding
                addDebugInfo("➡️ Redirecionando para /onboarding (erro ao criar, mas continuando)")
                setLoading(false)
                addDebugInfo("⏳ Aguardando 20s para capturar logs...")
                await new Promise(resolve => setTimeout(resolve, 20000))
                window.location.href = "/onboarding"
                return
              } else {
                addDebugInfo("✅ Registro criado com sucesso na tabela users")
                console.log("✅ Registro criado com sucesso:", newUser)
                // Após criar, redirecionar para onboarding
                addDebugInfo("➡️ Redirecionando para /onboarding (registro criado)")
                setLoading(false)
                addDebugInfo("⏳ Aguardando 20s para capturar logs...")
                await new Promise(resolve => setTimeout(resolve, 20000))
                window.location.href = "/onboarding"
                return
              }
            }
            
            // Para outros erros, redirecionar para onboarding
            addDebugInfo(`➡️ Redirecionando para /onboarding (erro desconhecido: ${profileError.message})`)
            setLoading(false)
            console.log("➡️ Redirecionando para /onboarding (erro desconhecido)")
            addDebugInfo("⏳ Aguardando 20s para capturar logs...")
            await new Promise(resolve => setTimeout(resolve, 20000))
            window.location.href = "/onboarding"
            return
          }

          // Se não encontrou o perfil ou onboarding não completo, vai para onboarding
          if (!userProfile) {
            addDebugInfo("⚠️ Perfil não encontrado na tabela users")
            console.log("⚠️ Perfil não encontrado, redirecionando para onboarding")
            setLoading(false)
            addDebugInfo("⏳ Aguardando 20s para capturar logs...")
            await new Promise(resolve => setTimeout(resolve, 20000))
            window.location.href = "/onboarding"
            return
          }

          addDebugInfo(`Onboarding completo na tabela: ${userProfile.onboarding_completo ? 'Sim' : 'Não'}`)

          if (!userProfile.onboarding_completo) {
            addDebugInfo("📝 Onboarding não completo, preparando redirecionamento...")
            console.log("📝 Onboarding não completo, redirecionando para /onboarding")
            
            // Forçar refresh da sessão para garantir que os cookies estão atualizados
            addDebugInfo("🔄 Atualizando sessão...")
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) {
              addDebugInfo(`❌ ERRO ao atualizar sessão: ${refreshError.message}`)
            } else {
              addDebugInfo(`✅ Sessão atualizada: ${!!refreshedSession}`)
              if (refreshedSession) {
                addDebugInfo(`Token expira em: ${new Date(refreshedSession.expires_at! * 1000).toLocaleString('pt-BR')}`)
              }
            }
            console.log("🔄 Sessão atualizada:", !!refreshedSession, refreshError ? `Erro: ${refreshError.message}` : "")
            
            // Aguardar para garantir que os cookies foram propagados
            addDebugInfo("⏳ Aguardando 500ms para propagação de cookies...")
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Verificar novamente se a sessão está ativa antes de redirecionar
            const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession()
            addDebugInfo(`🔐 Sessão final antes de redirecionar: ${!!finalSession}`)
            if (finalSessionError) {
              addDebugInfo(`❌ ERRO ao verificar sessão final: ${finalSessionError.message}`)
            }
            console.log("🔐 Sessão final antes de redirecionar:", !!finalSession)
            
            if (!finalSession) {
              const errorMsg = "Erro ao estabelecer sessão. Tente fazer login novamente."
              addDebugInfo(`❌ ERRO: ${errorMsg}`)
              console.error("❌ Sessão não encontrada, não é possível redirecionar")
              setError(errorMsg)
              setLoading(false)
              return
            }
            
            // Verificar cookies
            addDebugInfo("🍪 Verificando cookies antes de redirecionar...")
            addDebugInfo(`Cookies encontrados: ${document.cookie ? 'Sim' : 'Não'}`)
            if (document.cookie) {
              const cookies = document.cookie.split(';').map(c => c.trim().split('=')[0])
              addDebugInfo(`Nomes dos cookies: ${cookies.join(', ')}`)
              // Verificar se há cookies do Supabase
              const supabaseCookies = cookies.filter(c => c.includes('supabase') || c.includes('sb-'))
              addDebugInfo(`Cookies do Supabase: ${supabaseCookies.length > 0 ? supabaseCookies.join(', ') : 'Nenhum encontrado'}`)
            }
            console.log("🍪 Verificando cookies antes de redirecionar...")
            console.log("Cookies:", document.cookie)
            
            setLoading(false)
            
            // Usar window.location.href para garantir que os cookies sejam enviados corretamente
            // router.push faz navegação client-side que pode não enviar cookies na primeira requisição
            addDebugInfo("➡️ Redirecionando usando window.location.href...")
            console.log("➡️ Redirecionando para /onboarding usando window.location.href...")
            console.log("🍪 Cookies antes do redirecionamento:", document.cookie)
            
            // Aguardar mais tempo para garantir que os cookies foram persistidos no navegador
            // e que o Supabase terminou de processar a sessão
            addDebugInfo("⏳ Aguardando 20s para você capturar os logs...")
            addDebugInfo("📋 Os logs do terminal devem aparecer agora!")
            console.log("⏳ [Login] Aguardando 20 segundos antes de redirecionar para capturar logs...")
            console.log("📋 [Login] Verificando autenticação...")
            await new Promise(resolve => setTimeout(resolve, 20000))
            
            // Verificar cookies novamente antes de redirecionar
            addDebugInfo("🍪 Verificando cookies finais antes de redirecionar...")
            console.log("🍪 Cookies finais:", document.cookie)
            
            // Forçar reload completo para garantir que os cookies sejam enviados
            addDebugInfo("🚀 Executando redirecionamento agora...")
            console.log("🚀 [Login] Redirecionando para /onboarding agora...")
            window.location.href = "/onboarding"
            return
          } else {
            addDebugInfo("✅ Onboarding completo, redirecionando para /dashboard")
            console.log("✅ Onboarding completo, redirecionando para /dashboard")
            
            addDebugInfo("🔄 Atualizando sessão antes de ir para dashboard...")
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) {
              addDebugInfo(`❌ ERRO ao atualizar sessão: ${refreshError.message}`)
            } else {
              addDebugInfo(`✅ Sessão atualizada: ${!!refreshedSession}`)
            }
            console.log("🔄 Sessão atualizada:", !!refreshedSession)
            
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const { data: { session: finalSession }, error: finalSessionError } = await supabase.auth.getSession()
            addDebugInfo(`🔐 Sessão final antes de ir para dashboard: ${!!finalSession}`)
            if (finalSessionError) {
              addDebugInfo(`❌ ERRO ao verificar sessão final: ${finalSessionError.message}`)
            }
            console.log("🔐 Sessão final antes de redirecionar:", !!finalSession)
            
            if (!finalSession) {
              const errorMsg = "Erro ao estabelecer sessão. Tente fazer login novamente."
              addDebugInfo(`❌ ERRO: ${errorMsg}`)
              console.error("❌ Sessão não encontrada")
              setError(errorMsg)
              setLoading(false)
              return
            }
            
            setLoading(false)
            
            addDebugInfo("➡️ Redirecionando para /dashboard...")
            addDebugInfo("⏳ Aguardando 20s para capturar logs...")
            console.log("⏳ [Login] Aguardando 20 segundos antes de redirecionar para /dashboard...")
            await new Promise(resolve => setTimeout(resolve, 20000))
            
            console.log("🚀 [Login] Redirecionando para /dashboard agora...")
            window.location.href = "/dashboard"
            return
          }
        } catch (err: any) {
          // Em caso de erro, vai para onboarding
          const errorMsg = `Erro ao verificar onboarding: ${err.message || 'Erro desconhecido'}`
          addDebugInfo(`❌ ERRO: ${errorMsg}`)
          console.error("❌ Erro ao verificar onboarding:", err)
          setError(errorMsg)
          setLoading(false)
          // Ainda assim, tentar redirecionar para onboarding
          addDebugInfo("⏳ Aguardando 20s para capturar logs...")
          await new Promise(resolve => setTimeout(resolve, 20000))
          window.location.href = "/onboarding"
          return
        }
      } else {
        addDebugInfo("❌ ERRO: data.user não está disponível após login")
        setError("Erro: Dados do usuário não disponíveis após login. Tente novamente.")
        setLoading(false)
        return
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err)
      addDebugInfo(`❌ ERRO GERAL: ${errorMsg}`)
      addDebugInfo(`Detalhes: ${err.message || 'N/A'}`)
      setError(`${errorMsg} (Detalhes no console)`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
          C
        </div>
        <span className="font-display text-2xl font-bold text-white">CONTRAL</span>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Entrar na sua conta</h1>
        <p className="text-slate-400 mb-8">Bem-vindo de volta! Faça login para continuar.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={`pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                  email && !emailValid ? "border-red-500" : ""
                }`}
                placeholder="seu@email.com"
              />
            </div>
            {email && !emailValid && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Por favor, verifique o formato do email
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Link
                href="/esqueci-senha"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            <Label htmlFor="remember-me" className="ml-2 text-sm text-slate-300 cursor-pointer">
              Lembrar-me
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400 font-semibold">{error}</p>
                {(error.includes("não foi verificado") || error.includes("verifique sua caixa")) && (
                  <Link href={`/verificar-email?email=${encodeURIComponent(email)}`} className="text-sm text-blue-400 hover:text-blue-300 underline mt-2 block">
                    Reenviar email de verificação
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Debug Info */}
          {debugInfo.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-xs text-slate-400 font-semibold mb-2">🔍 Debug Info (últimas {debugInfo.length} mensagens):</p>
              <div className="space-y-1">
                {debugInfo.slice(-10).map((info, index) => (
                  <p key={index} className="text-xs text-slate-500 font-mono">
                    {info}
                  </p>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setDebugInfo([])}
                className="text-xs text-blue-400 hover:text-blue-300 mt-2"
              >
                Limpar debug
              </button>
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading || !emailValid}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900 text-slate-400">Ou continue com</span>
          </div>
        </div>

        {/* Google Button - Desabilitado */}
        <Button
          type="button"
          variant="outline"
          disabled
          className="w-full bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-800 py-6 cursor-not-allowed opacity-50"
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google (em breve)
        </Button>

        {/* Register Link */}
        <div className="mt-6 text-center text-slate-400">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-blue-400 hover:text-blue-300 underline transition-colors">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  )
}
