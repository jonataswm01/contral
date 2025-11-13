"use client"

import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  )
}

