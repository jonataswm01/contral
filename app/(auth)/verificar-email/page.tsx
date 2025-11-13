"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Mail, AlertCircle, ArrowLeft, Send, CheckCircle2 } from "lucide-react"

export default function VerificarEmailPage() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [tempPassword, setTempPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Preencher email da URL se disponível
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
      setSuccess(true)
    }
  }, [searchParams])

  // Focar no primeiro input quando montar
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Função para lidar com mudança nos inputs do código
  const handleCodeChange = (index: number, value: string) => {
    // Aceitar apenas números
    const numericValue = value.replace(/\D/g, "")
    
    if (numericValue.length > 1) {
      // Se colar múltiplos dígitos
      const digits = numericValue.slice(0, 6).split("")
      const newCode = [...code]
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit
        }
      })
      setCode(newCode)
      
      // Focar no próximo input disponível
      const nextIndex = Math.min(index + digits.length, 5)
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus()
      }
    } else {
      const newCode = [...code]
      newCode[index] = numericValue
      setCode(newCode)

      // Mover para o próximo input se digitou algo
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  // Função para lidar com backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Função para verificar o código
  const handleVerify = async () => {
    setLoading(true)
    setError(null)

    const fullCode = code.join("")
    
    if (fullCode.length !== 6) {
      setError("Por favor, preencha todos os 6 dígitos do código.")
      setLoading(false)
      return
    }

    // Nota: O Supabase não suporta OTP de 6 dígitos nativamente
    // Por enquanto, vamos orientar o usuário a usar o link do email
    setError("Para verificar, clique no link que enviamos no seu email. O código de 6 dígitos será implementado em breve.")
    setLoading(false)
  }

  // Função para verificar usando senha temporária
  const handleVerifyWithPassword = async () => {
    if (!tempPassword || tempPassword.length < 6) {
      setError("Por favor, insira a senha temporária de 6 caracteres do email.")
      return
    }

    setLoading(true)
    setError(null)

    // Nota: A senha temporária requer implementação customizada no backend
    // Por enquanto, vamos orientar o usuário a usar o link do email
    setError("Para verificar, clique no link que enviamos no seu email. A senha temporária será implementada em breve.")
    setLoading(false)
  }

  // Função para reenviar email
  const handleResendEmail = async () => {
    setLoading(true)
    setError(null)

    if (!email) {
      setError("Por favor, informe seu email.")
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, verifique o formato do email.")
      setLoading(false)
      return
    }

    // Verificar se Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      setError("Ops! Parece que há um problema de configuração. Entre em contato com o suporte.")
      setLoading(false)
      return
    }

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup&next=/onboarding`,
        },
      })

      if (resendError) {
        setError("Ocorreu um erro ao reenviar o email. Verifique se o email está correto.")
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      
      // Resetar código
      setCode(["", "", "", "", "", ""])
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    } catch (err: any) {
      setError("Ocorreu um erro inesperado. Tente novamente.")
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
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifique seu e-mail</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Seu cadastro foi realizado com sucesso. Enviamos um e-mail com um link de verificação.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mt-2">
              Alternativamente, você pode usar a senha temporária do e-mail para verificação.
            </p>
          </div>

          {/* Campos de Código */}
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-semibold bg-slate-800 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading || code.some(c => !c)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verificando..." : "Verificar"}
            </Button>
            
            <p className="text-xs text-slate-500 text-center">
              💡 Dica: Clique no link "Verificar email" no seu email para verificar automaticamente
            </p>
          </div>

          {/* Senha Temporária */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Ou use a senha temporária do email:</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value.toUpperCase())}
                placeholder="Ex: 29FB5F"
                maxLength={6}
                className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500 uppercase font-mono text-center tracking-widest"
              />
              <Button
                onClick={handleVerifyWithPassword}
                disabled={loading || !tempPassword}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              >
                {loading ? "..." : "Usar"}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              A senha temporária de 6 caracteres está no email que enviamos
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Sucesso */}
          {success && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-400">
                Email reenviado com sucesso! Verifique sua caixa de entrada.
              </p>
            </div>
          )}

          {/* Reenviar */}
          <div className="pt-4 border-t border-slate-700">
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full text-center"
            >
              Não recebeu um e-mail? <span className="underline">Reenviar</span>
            </button>
          </div>

          {/* Voltar */}
          <div className="pt-2">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
