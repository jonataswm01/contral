"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Lock, Eye, EyeOff, AlertCircle, Check, X, ArrowLeft } from "lucide-react"

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  // Validações em tempo real
  const passwordHasMinLength = password.length >= 8
  const passwordHasNumber = /\d/.test(password)
  const passwordValid = passwordHasMinLength && passwordHasNumber
  const passwordsMatch = password === "" || confirmPassword === "" || password === confirmPassword

  useEffect(() => {
    // Verificar se há um token de hash na URL (Supabase envia como #access_token)
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get("access_token")
      const type = params.get("type")
      
      if (accessToken && type === "recovery") {
        // O token já foi processado pelo Supabase, podemos continuar
      }
    }
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
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

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError("Ocorreu um erro ao redefinir a senha. O link pode ter expirado. Tente solicitar um novo.")
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      setError("Ocorreu um erro inesperado. Tente novamente.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 md:p-10 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-500/20 p-4">
              <Check className="h-12 w-12 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Senha redefinida!</h2>
            <p className="text-slate-400">Sua senha foi alterada com sucesso.</p>
          </div>
          <p className="text-sm text-slate-500">Redirecionando para o login...</p>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-white mb-2">Redefinir senha</h1>
        <p className="text-slate-400 mb-8">Digite sua nova senha abaixo.</p>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Nova senha</Label>
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
                placeholder="Digite sua nova senha"
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
            <Label htmlFor="confirmPassword" className="text-white">Confirmar nova senha</Label>
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
                placeholder="Confirme sua nova senha"
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
                {error.includes("expirado") && (
                  <Link href="/esqueci-senha" className="text-sm text-blue-400 hover:text-blue-300 underline mt-2 block">
                    Solicitar novo link
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !passwordValid || !passwordsMatch}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}

