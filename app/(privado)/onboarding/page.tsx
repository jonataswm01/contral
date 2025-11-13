"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  UtensilsCrossed,
  Car,
  Home,
  Heart,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Package,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3

// Faixas de renda
const RENDA_FAIXAS = [
  { value: "0-1000", label: "Até R$ 1.000", media: 500 },
  { value: "1000-2000", label: "R$ 1.000 - R$ 2.000", media: 1500 },
  { value: "2000-3000", label: "R$ 2.000 - R$ 3.000", media: 2500 },
  { value: "3000-5000", label: "R$ 3.000 - R$ 5.000", media: 4000 },
  { value: "5000-10000", label: "R$ 5.000 - R$ 10.000", media: 7500 },
  { value: "10000+", label: "Acima de R$ 10.000", media: 12000 },
]

// Faixas de meta de economia
const META_ECONOMIA_FAIXAS = [
  { value: "0-500", label: "Até R$ 500", media: 250 },
  { value: "500-1000", label: "R$ 500 - R$ 1.000", media: 750 },
  { value: "1000-2000", label: "R$ 1.000 - R$ 2.000", media: 1500 },
  { value: "2000-3000", label: "R$ 2.000 - R$ 3.000", media: 2500 },
  { value: "3000+", label: "Acima de R$ 3.000", media: 4000 },
]

// Categorias principais
const CATEGORIAS_PADRAO = [
  { id: "alimentacao", nome: "Alimentação", icone: UtensilsCrossed, cor: "#EF4444" },
  { id: "transporte", nome: "Transporte", icone: Car, cor: "#F97316" },
  { id: "moradia", nome: "Moradia", icone: Home, cor: "#8B5CF6" },
  { id: "saude", nome: "Saúde", icone: Heart, cor: "#F43F5E" },
  { id: "educacao", nome: "Educação", icone: GraduationCap, cor: "#3B82F6" },
  { id: "lazer", nome: "Lazer", icone: Gamepad2, cor: "#EC4899" },
  { id: "compras", nome: "Compras", icone: ShoppingBag, cor: "#10B981" },
  { id: "outros", nome: "Outros", icone: Package, cor: "#6B7280" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Verificar se o usuário já completou o onboarding
  // Nota: A autenticação já é verificada pelo ProtectedRoute no layout
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Obter usuário atual (já autenticado pelo ProtectedRoute)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error("❌ [Onboarding] Erro ao obter usuário:", userError)
          setChecking(false)
          return
        }

        // PRIMEIRO: Verificar user_metadata (mais confiável, não depende de RLS)
        const onboardingCompletoMetadata = user.user_metadata?.onboarding_completo
        
        if (onboardingCompletoMetadata === true) {
          router.push("/dashboard")
          return
        }

        // SEGUNDO: Se não estiver no metadata, verificar na tabela users
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("onboarding_completo")
          .eq("id", user.id)
          .single()

        if (profileError) {
          // Se der erro, assumir que não completou e mostrar a página
          console.debug("[Onboarding] Erro ao buscar perfil (ignorado):", profileError)
          setChecking(false)
          return
        }

        if (userProfile?.onboarding_completo) {
          router.push("/dashboard")
          return
        }

        // Onboarding não completo, mostrar formulário
        setChecking(false)
      } catch (err) {
        console.error("❌ [Onboarding] Erro ao verificar status:", err)
        setChecking(false)
      }
    }

    checkOnboardingStatus()
  }, [router, supabase])

  // Etapa 1: Situação Financeira
  const [rendaFaixa, setRendaFaixa] = useState<string>("")
  const [temMetaEconomia, setTemMetaEconomia] = useState(false)
  const [metaEconomiaFaixa, setMetaEconomiaFaixa] = useState<string>("")

  // Etapa 2: Categorias
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([])
  const [opcaoCategorias, setOpcaoCategorias] = useState<"padrao" | "personalizar" | "depois" | null>(null)

  // Etapa 3: Dados Extras
  const [whatsapp, setWhatsapp] = useState("")
  const [diaPagamento, setDiaPagamento] = useState<Date | undefined>(undefined)

  // Calcular progresso
  const progress = ((currentStep - 1) / 2) * 100

  // Validações
  const canProceedStep1 = rendaFaixa !== ""
  const canProceedStep2 = opcaoCategorias !== null
  const canProceedStep3 = true // Tudo opcional na etapa 3

  const canProceed = {
    1: canProceedStep1,
    2: canProceedStep2,
    3: canProceedStep3,
  }

  const handleNext = () => {
    if (currentStep < 3 && canProceed[currentStep]) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const formatPhoneInput = (value: string): string => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value)
    setWhatsapp(formatted)
  }

  const handleCategoriaToggle = (categoriaId: string) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(categoriaId)
        ? prev.filter((id) => id !== categoriaId)
        : [...prev, categoriaId]
    )
  }

  const handleOpcaoCategorias = (opcao: "padrao" | "personalizar" | "depois") => {
    setOpcaoCategorias(opcao)
    if (opcao === "padrao") {
      // Selecionar todas as categorias
      setCategoriasSelecionadas(CATEGORIAS_PADRAO.map((c) => c.id))
    } else if (opcao === "depois") {
      // Limpar seleção
      setCategoriasSelecionadas([])
    }
  }

  const handleFinish = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Calcular valores
      const rendaMensal = RENDA_FAIXAS.find((f) => f.value === rendaFaixa)?.media || 0
      const metaEconomiaMensal = temMetaEconomia && metaEconomiaFaixa
        ? META_ECONOMIA_FAIXAS.find((f) => f.value === metaEconomiaFaixa)?.media || null
        : null
      const diaPagamentoNum = diaPagamento ? diaPagamento.getDate() : null
      const whatsappLimpo = whatsapp.replace(/\D/g, "")

      // Atualizar tabela users
      const updateData: any = {
        renda_mensal: rendaMensal,
        onboarding_completo: true,
      }

      if (metaEconomiaMensal) {
        updateData.meta_economia_mensal = metaEconomiaMensal
      }

      if (diaPagamentoNum) {
        updateData.dia_pagamento = diaPagamentoNum
      }

      if (whatsappLimpo) {
        updateData.telefone = whatsappLimpo
      }

      // Atualizar user_metadata do Supabase Auth (mais confiável)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          onboarding_completo: true,
        }
      })

      if (metadataError) {
        console.error("Erro ao atualizar metadata:", metadataError)
      } else {
        console.log("✅ Metadata atualizada com sucesso")
      }

      // Também atualizar tabela users para consistência
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id)

      if (updateError) {
        console.error("Erro ao salvar dados na tabela users:", updateError)
        // Não bloquear se der erro na tabela, mas avisar
        console.warn("⚠️ Dados salvos no metadata, mas erro ao salvar na tabela users")
      }

      // Criar categorias selecionadas
      if (opcaoCategorias === "padrao" || (opcaoCategorias === "personalizar" && categoriasSelecionadas.length > 0)) {
        const categoriasParaCriar = opcaoCategorias === "padrao"
          ? CATEGORIAS_PADRAO
          : CATEGORIAS_PADRAO.filter((c) => categoriasSelecionadas.includes(c.id))

        for (const categoria of categoriasParaCriar) {
          // Mapear componente do ícone para nome string
          const iconNameMap: Record<string, string> = {
            "UtensilsCrossed": "UtensilsCrossed",
            "Car": "Car",
            "Home": "Home",
            "Heart": "Heart",
            "GraduationCap": "GraduationCap",
            "Gamepad2": "Gamepad2",
            "ShoppingBag": "ShoppingBag",
            "Package": "Package",
          }
          
          // Obter nome do ícone (o componente tem uma propriedade displayName ou podemos usar o id)
          const iconName = iconNameMap[categoria.id] || categoria.id.charAt(0).toUpperCase() + categoria.id.slice(1)
          
          // Primeira tentativa: user_id e is_padrao (estrutura do usuário)
          const { error: error1 } = await supabase
            .from("categorias")
            .insert({
              user_id: user.id,
              nome: categoria.nome,
              tipo: "despesa",
              icone: iconName,
              cor: categoria.cor,
              is_padrao: true,
              ordem: CATEGORIAS_PADRAO.indexOf(categoria) + 1,
            })
          
          if (error1) {
            // Segunda tentativa: usuario_id e e_padrao (schema.sql)
            const { error: error2 } = await supabase
              .from("categorias")
              .insert({
                usuario_id: user.id,
                nome: categoria.nome,
                tipo: "despesa",
                icone: iconName,
                cor: categoria.cor,
                e_padrao: true,
                ordem: CATEGORIAS_PADRAO.indexOf(categoria) + 1,
              })
            
            if (error2) {
              console.error(`Erro ao criar categoria ${categoria.nome}:`, error2)
            }
          }
        }
      }

      // Redirecionar para dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao finalizar onboarding. Tente novamente.")
      setLoading(false)
    }
  }

  // Mostrar loading enquanto verifica o status
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Verificando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Sair
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
            C
          </div>
          <span className="font-display text-xl font-bold text-white">CONTRAL</span>
        </div>

        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Progress Indicator */}
      <div className="px-6 pb-4">
        <p className="text-slate-400 text-sm mb-2">Etapa {currentStep} de 3</p>
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                step <= currentStep
                  ? "bg-emerald-500"
                  : "bg-slate-700"
              )}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Etapa 1: Situação Financeira */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Vamos começar! 🚀
                </h1>
                <p className="text-slate-400 text-base leading-relaxed">
                  Qual sua situação financeira? Isso nos ajuda a personalizar sua experiência.
                </p>
              </div>

              <div className="space-y-6">
                {/* Renda Mensal */}
                <div className="space-y-2">
                  <Label htmlFor="renda" className="text-slate-400 text-sm">
                    Renda Mensal *
                  </Label>
                  <Select value={rendaFaixa} onValueChange={setRendaFaixa}>
                    <SelectTrigger
                      id="renda"
                      className="h-12 bg-slate-900 border-slate-700 text-white text-base focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <SelectValue placeholder="Selecione uma faixa" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {RENDA_FAIXAS.map((faixa) => (
                        <SelectItem
                          key={faixa.value}
                          value={faixa.value}
                          className="text-white focus:bg-slate-800"
                        >
                          {faixa.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Meta de Economia */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      id="tem-meta"
                      type="checkbox"
                      checked={temMetaEconomia}
                      onChange={(e) => {
                        setTemMetaEconomia(e.target.checked)
                        if (!e.target.checked) {
                          setMetaEconomiaFaixa("")
                        }
                      }}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                    />
                    <Label htmlFor="tem-meta" className="text-slate-300 cursor-pointer text-base">
                      Tenho uma meta de economia mensal
                    </Label>
                  </div>

                  {temMetaEconomia && (
                    <div className="space-y-2 pl-8">
                      <Label className="text-slate-400 text-sm">
                        Qual sua meta?
                      </Label>
                      <Select
                        value={metaEconomiaFaixa}
                        onValueChange={setMetaEconomiaFaixa}
                      >
                        <SelectTrigger className="h-12 bg-slate-900 border-slate-700 text-white text-base focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue placeholder="Selecione uma faixa" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          {META_ECONOMIA_FAIXAS.map((faixa) => (
                            <SelectItem
                              key={faixa.value}
                              value={faixa.value}
                              className="text-white focus:bg-slate-800"
                            >
                              {faixa.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Etapa 2: Categorias */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Quais categorias você mais usa?
                </h1>
                <p className="text-slate-400 text-base leading-relaxed">
                  Selecione as categorias principais. Pode adicionar mais depois, sem pressa! 😊
                </p>
              </div>

              {/* Opções Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleOpcaoCategorias("padrao")}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    opcaoCategorias === "padrao"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-900 hover:border-slate-600"
                  )}
                >
                  <div className="font-semibold text-white mb-1">Usar padrão</div>
                  <div className="text-sm text-slate-400">Todas as categorias principais</div>
                </button>

                <button
                  onClick={() => handleOpcaoCategorias("personalizar")}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    opcaoCategorias === "personalizar"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-900 hover:border-slate-600"
                  )}
                >
                  <div className="font-semibold text-white mb-1">Personalizar</div>
                  <div className="text-sm text-slate-400">Escolher as que você usa</div>
                </button>

                <button
                  onClick={() => handleOpcaoCategorias("depois")}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    opcaoCategorias === "depois"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-900 hover:border-slate-600"
                  )}
                >
                  <div className="font-semibold text-white mb-1">Configurar depois</div>
                  <div className="text-sm text-slate-400">Pular esta etapa</div>
                </button>
              </div>

              {/* Lista de Categorias (só aparece se escolheu personalizar) */}
              {opcaoCategorias === "personalizar" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CATEGORIAS_PADRAO.map((categoria) => {
                    const IconComponent = categoria.icone
                    const isSelected = categoriasSelecionadas.includes(categoria.id)
                    return (
                      <button
                        key={categoria.id}
                        onClick={() => handleCategoriaToggle(categoria.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 relative",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-slate-700 bg-slate-900 hover:border-slate-600"
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "h-8 w-8",
                            isSelected ? "text-emerald-400" : "text-slate-400"
                          )}
                        />
                        <span className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-white" : "text-slate-400"
                        )}>
                          {categoria.nome}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Etapa 3: Dados Extras */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Quase lá! 🎉
                </h1>
                <p className="text-slate-400 text-base leading-relaxed">
                  Alguns dados extras para personalizar ainda mais sua experiência.
                </p>
              </div>

              <div className="space-y-6">
                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-slate-400 text-sm">
                    Número de WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    type="text"
                    value={whatsapp}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="bg-slate-900 border-slate-700 text-white h-12 text-base focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500">
                    Usado para enviar lembretes e insights (opcional)
                  </p>
                </div>

                {/* Dia do Pagamento */}
                <div className="space-y-2">
                  <Label className="text-slate-400 text-sm">
                    Dia do Pagamento
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal text-base bg-slate-900 border-slate-700 text-white hover:bg-slate-800",
                          !diaPagamento && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {diaPagamento ? (
                          `Dia ${diaPagamento.getDate()}`
                        ) : (
                          <span>Selecione o dia (opcional)</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700" align="start">
                      <Calendar
                        mode="single"
                        selected={diaPagamento}
                        onSelect={(date) => {
                          if (date) {
                            const today = new Date()
                            const selectedDay = date.getDate()
                            const newDate = new Date(today.getFullYear(), today.getMonth(), selectedDay)
                            setDiaPagamento(newDate)
                          }
                        }}
                        locale={ptBR}
                        initialFocus
                        className="bg-slate-900"
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-slate-500">
                    Para lembretes automáticos (opcional)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Button */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed[currentStep] || loading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Próximo passo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={loading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Finalizando..." : "Tudo certo! 🎉"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

