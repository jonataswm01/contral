"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, Eye, EyeOff, User, Phone, X, Check, AlertCircle } from "lucide-react"

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Validações em tempo real
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailValid = email === "" || emailRegex.test(email)
  
  const passwordHasMinLength = password.length >= 8
  const passwordHasNumber = /\d/.test(password)
  const passwordValid = passwordHasMinLength && passwordHasNumber
  
  const passwordsMatch = password === "" || confirmPassword === "" || password === confirmPassword
  const telefoneRegex = /^[\d\s\(\)\-\+]+$/
  const telefoneValid = telefone === "" || telefoneRegex.test(telefone.replace(/\s/g, ""))

  // Formatação de telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
      } else {
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
      }
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setTelefone(formatted)
  }

  const getErrorMessage = (error: any): string => {
    if (!error) return "Ocorreu um erro inesperado. Tente novamente."
    
    const errorCode = error.code || error.message
    
    if (errorCode.includes("email_address_invalid") || errorCode.includes("invalid_email")) {
      return "Por favor, verifique o formato do email."
    }
    
    if (errorCode.includes("email_already_registered") || errorCode.includes("user_already_exists")) {
      return "Este email já está em uso. Quer fazer login?"
    }
    
    if (errorCode.includes("password_too_short") || errorCode.includes("password_length")) {
      return "A senha deve ter pelo menos 8 caracteres e 1 número."
    }
    
    if (errorCode.includes("invalid_credentials") || errorCode.includes("email_not_confirmed")) {
      return "Email ou senha incorretos. Verifique se confirmou seu email."
    }
    
    return error.message || "Ocorreu um erro. Tente novamente."
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      setError("Ops! Parece que há um problema de configuração. Entre em contato com o suporte.")
      setLoading(false)
      return
    }

    // Validações
    if (!emailValid) {
      setError("Por favor, verifique o formato do email.")
      setLoading(false)
      return
    }

    if (!passwordValid) {
      setError("A senha deve ter pelo menos 8 caracteres e 1 número.")
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError("As senhas não coincidem. Verifique e tente novamente.")
      setLoading(false)
      return
    }

    if (telefone && !telefoneValid) {
      setError("Por favor, verifique o formato do telefone.")
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup&next=/onboarding`,
          data: {
            name: name,
            telefone: telefone.replace(/\D/g, ""), // Remove formatação
          },
        },
      })

      if (signUpError) {
        setError(getErrorMessage(signUpError))
        setLoading(false)
        return
      }

      if (data.user) {
        // Verificar se o email foi confirmado
        const emailConfirmed = !!data.user.email_confirmed_at

        // Criar registro na tabela users (mesmo sem email confirmado)
        const telefoneLimpo = telefone.replace(/\D/g, "")
        
        // IMPORTANTE: A tabela users requer email e telefone como NOT NULL
        // Mas email já está em auth.users, então vamos usar o mesmo email
        // Se telefone não foi preenchido, vamos usar um placeholder temporário
        const telefoneFinal = telefoneLimpo || `temp_${data.user.id.substring(0, 8)}`
        
        // Tentar usar a tabela users existente
        const { data: userData, error: userError } = await supabase.from("users").insert({
          id: data.user.id,
          email: email, // Campo obrigatório na tabela users
          nome: name,
          telefone: telefoneFinal, // Campo obrigatório e UNIQUE na tabela users
          trial_ate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias
          onboarding_completo: false, // Importante: começa como false
        }).select().single()

        if (userError) {
          console.error("Erro ao criar registro em users:", userError)
          // Mostrar erro mais detalhado para debug
          console.error("Detalhes do erro:", {
            message: userError.message,
            code: userError.code,
            details: userError.details,
            hint: userError.hint,
          })
          
          // Se for erro de RLS ou tabela não existe, mostrar mensagem amigável
          if (userError.message.includes("permission denied") || userError.message.includes("new row violates row-level security")) {
            setError("Ops! Não foi possível salvar seus dados. Isso pode ser um problema de permissões. Entre em contato com o suporte.")
          } else if (userError.message.includes("relation") && userError.message.includes("does not exist")) {
            setError("A tabela users não existe no banco de dados. Verifique a estrutura do banco.")
          } else if (userError.message.includes("duplicate key") || userError.message.includes("already exists") || userError.message.includes("unique constraint")) {
            // Se já existe (por email ou telefone), tentar atualizar
            console.log("Registro já existe, tentando atualizar...")
            const telefoneFinal = telefoneLimpo || `temp_${data.user.id.substring(0, 8)}`
            const { error: updateError } = await supabase.from("users").update({
              nome: name,
              telefone: telefoneFinal,
              email: email, // Garantir que email está atualizado
            }).eq("id", data.user.id)
            
            if (updateError) {
              console.error("Erro ao atualizar:", updateError)
            } else {
              console.log("✅ Registro atualizado com sucesso")
            }
          } else {
            // Não bloqueia o cadastro, mas informa o usuário
            setError(`Aviso: Seu cadastro foi criado, mas houve um problema ao salvar seus dados. Erro: ${userError.message}`)
          }
        } else {
          console.log("✅ Registro criado com sucesso em users:", userData)
        }

        // Criar categorias padrão (se a função existir)
        try {
          await supabase.rpc("criar_categorias_padrao", {
            usuario_uuid: data.user.id,
          })
        } catch (err) {
          console.error("Erro ao criar categorias padrão:", err)
        }

        // Criar conta padrão (se a função existir)
        try {
          await supabase.rpc("criar_conta_padrao", {
            usuario_uuid: data.user.id,
          })
        } catch (err) {
          console.error("Erro ao criar conta padrão:", err)
        }

        // Se email não foi confirmado, redirecionar para página de verificação
        if (!emailConfirmed) {
          router.push(`/verificar-email?email=${encodeURIComponent(email)}`)
        } else {
          // Se já confirmado (improvável, mas possível), ir direto para onboarding
          router.push("/onboarding")
        }
      }
    } catch (err: any) {
      setError(getErrorMessage(err))
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
        <h1 className="text-3xl font-bold text-white mb-2">Criar sua conta</h1>
        <p className="text-slate-400 mb-8">Preencha os detalhes para começar.</p>

        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

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

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-white">Telefone (WhatsApp)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="telefone"
                type="text"
                value={telefone}
                onChange={handlePhoneChange}
                disabled={loading}
                className={`pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                  telefone && !telefoneValid ? "border-red-500" : ""
                }`}
                placeholder="(11) 99999-9999"
              />
            </div>
            {telefone && !telefoneValid && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Por favor, verifique o formato do telefone
              </p>
            )}
            <p className="text-xs text-slate-500">Opcional - usado para receber lembretes e insights</p>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={`pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                  password && !passwordValid ? "border-red-500" : ""
                }`}
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
            {/* Password Validation */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {passwordHasMinLength ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <X className="h-4 w-4 text-red-400" />
                )}
                <span className={passwordHasMinLength ? "text-emerald-400" : "text-slate-400"}>
                  8 ou mais caracteres
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordHasNumber ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <X className="h-4 w-4 text-red-400" />
                )}
                <span className={passwordHasNumber ? "text-emerald-400" : "text-slate-400"}>
                  Pelo menos 1 número
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className={`pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                  confirmPassword && !passwordsMatch ? "border-red-500" : ""
                }`}
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                As senhas não coincidem
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
                {error.includes("já está em uso") && (
                  <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 underline mt-2 block">
                    Fazer login agora
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Create Account Button */}
          <Button
            type="submit"
            disabled={loading || !passwordValid || !passwordsMatch || !emailValid || (telefone ? !telefoneValid : false)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Criando conta..." : "Criar conta"}
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

        {/* Login Link */}
        <div className="mt-6 text-center text-slate-400">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 underline transition-colors">
            Entrar
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-500 max-w-md px-4">
        <p>
          Ao se cadastrar, você concorda com nossos{" "}
          <Link href="#" className="text-slate-400 hover:text-white underline">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link href="#" className="text-slate-400 hover:text-white underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
