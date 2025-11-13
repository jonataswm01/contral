"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireOnboarding = false,
  redirectTo 
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, onboardingCompleto, isAuthenticated } = useAuth(true)

  useEffect(() => {
    if (loading) return

    // Se não está autenticado, já foi redirecionado pelo useAuth
    if (!isAuthenticated) return

    // Se está na página de onboarding e já completou, redirecionar
    if (pathname === "/onboarding" && onboardingCompleto === true) {
      router.push("/dashboard")
      return
    }

    // Se requer onboarding mas não completou e não está na página de onboarding
    if (requireOnboarding && onboardingCompleto === false && pathname !== "/onboarding") {
      router.push("/onboarding")
      return
    }

    // Se tem redirectTo customizado
    if (redirectTo && !loading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [loading, isAuthenticated, onboardingCompleto, pathname, router, requireOnboarding, redirectTo])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado, não renderiza nada (já foi redirecionado)
  if (!isAuthenticated) {
    return null
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>
}

