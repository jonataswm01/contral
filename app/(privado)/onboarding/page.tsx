"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ptBR } from "date-fns/locale"
import Cropper from "react-easy-crop"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  User,
  Camera,
  Wallet,
  Bot,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Area } from "react-easy-crop"
import { useToast } from "@/components/ui/use-toast"

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

// Configuração das etapas
const STEPS = [
  {
    id: 1,
    title: "Informações de Perfil",
    icon: User,
    description: "Complete seu perfil pessoal",
  },
  {
    id: 2,
    title: "Dados Financeiros",
    icon: Wallet,
    description: "Configure suas finanças",
  },
  {
    id: 3,
    title: "Assistente de IA",
    icon: Bot,
    description: "Conheça seu assistente",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [ativarIA, setAtivarIA] = useState(true)

  // Verificar se o usuário já completou o onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error("❌ [Onboarding] Erro ao obter usuário:", userError)
          setChecking(false)
          return
        }

        const onboardingCompletoMetadata = user.user_metadata?.onboarding_completo
        
        if (onboardingCompletoMetadata === true) {
          router.push("/dashboard")
          return
        }

        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("onboarding_completo")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.debug("[Onboarding] Erro ao buscar perfil (ignorado):", profileError)
          setChecking(false)
          return
        }

        if (userProfile?.onboarding_completo) {
          router.push("/dashboard")
          return
        }

        setChecking(false)
      } catch (err) {
        console.error("❌ [Onboarding] Erro ao verificar status:", err)
        setChecking(false)
      }
    }

    checkOnboardingStatus()
  }, [router, supabase])

  // ============================================
  // ESTADOS LOCAIS - Nenhum dado é salvo no banco até o final
  // Todos os dados ficam apenas em memória até o usuário clicar em "Finalizar"
  // ============================================
  
  // Etapa 1: Informações de Perfil
  const [nome, setNome] = useState("")
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null)
  const [fotoPerfilFile, setFotoPerfilFile] = useState<File | null>(null)
  const [profissao, setProfissao] = useState("")
  
  // Estados para crop de imagem
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // Etapa 2: Dados Financeiros
  const [rendaFaixa, setRendaFaixa] = useState<string>("")
  const [metaEconomiaFaixa, setMetaEconomiaFaixa] = useState<string>("")
  const [whatsapp, setWhatsapp] = useState("")
  const [diaPagamento, setDiaPagamento] = useState<Date | undefined>(undefined)

  // Validações
  const canProceedStep1 = nome.trim() !== ""
  const canProceedStep2 = rendaFaixa !== "" && metaEconomiaFaixa !== "" && whatsapp.replace(/\D/g, "").length >= 10 && diaPagamento !== undefined
  const canProceedStep3 = true // Etapa informativa

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

  const handleStepClick = (step: Step) => {
    // Só permite ir para etapas anteriores ou a próxima se a atual estiver completa
    if (step < currentStep || (step === currentStep + 1 && canProceed[currentStep])) {
      setCurrentStep(step)
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

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem válida")
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB")
        return
      }

      // Abrir modal de crop
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No 2d context")
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        }
      }, "image/jpeg", 0.95)
    })
  }

  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels)
      
      // Criar File a partir do Blob
      const file = new File([croppedImage], "profile.jpg", { type: "image/jpeg" })
      setFotoPerfilFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPerfil(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Fechar modal e resetar estados
      setShowCropModal(false)
      setImageToCrop(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    } catch (error) {
      console.error("Erro ao processar imagem:", error)
      alert("Erro ao processar a imagem. Tente novamente.")
    }
  }

  const handleCancelCrop = () => {
    setShowCropModal(false)
    setImageToCrop(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFotoClick = () => {
    fileInputRef.current?.click()
  }

  // ============================================
  // FUNÇÃO PRINCIPAL: handleFinish
  // Esta é a ÚNICA função que salva dados no banco
  // Todos os dados coletados são salvos de uma vez só, apenas no final
  // ============================================
  const handleFinish = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // ============================================
      // PASSO 1: Upload da foto de perfil (se houver)
      // A foto é enviada para o storage, mas ainda não salva no banco
      // ============================================
      let fotoUrl = null
      if (fotoPerfilFile) {
        try {
          const fileExt = fotoPerfilFile.name.split(".").pop()
          const fileName = `${user.id}-${Date.now()}.${fileExt}`
          const filePath = `profiles/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, fotoPerfilFile, {
              cacheControl: "3600",
              upsert: false,
            })

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath)
            fotoUrl = publicUrl
          } else {
            console.warn("Erro ao fazer upload da foto:", uploadError)
            // Não bloqueia o onboarding se o upload falhar
          }
        } catch (err) {
          console.warn("Erro ao processar foto:", err)
          // Não bloqueia o onboarding se o upload falhar
        }
      }

      // ============================================
      // PASSO 2: Validação de todos os dados obrigatórios
      // Valida antes de tentar salvar
      // ============================================
      // Validar dados antes de enviar
      if (!nome.trim()) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "Por favor, preencha seu nome",
        })
        setLoading(false)
        return
      }

      if (!rendaFaixa) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "Por favor, selecione sua renda mensal",
        })
        setLoading(false)
        return
      }

      if (!metaEconomiaFaixa) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "Por favor, selecione sua meta de economia",
        })
        setLoading(false)
        return
      }

      if (!whatsapp.replace(/\D/g, "").length || whatsapp.replace(/\D/g, "").length < 10) {
        toast({
          variant: "destructive",
          title: "WhatsApp inválido",
          description: "Por favor, informe um número de WhatsApp válido",
        })
        setLoading(false)
        return
      }

      if (!diaPagamento) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "Por favor, selecione o dia do seu pagamento",
        })
        setLoading(false)
        return
      }

      // ============================================
      // PASSO 3: Preparar todos os dados coletados
      // Todos os dados das 3 etapas são preparados aqui
      // ============================================
      const diaPagamentoNum = diaPagamento.getDate()
      
      // Calcular valores numéricos das faixas
      const rendaMensal = RENDA_FAIXAS.find((f) => f.value === rendaFaixa)?.media || 0
      const metaEconomiaMensal = META_ECONOMIA_FAIXAS.find((f) => f.value === metaEconomiaFaixa)?.media || 0
      const whatsappLimpo = whatsapp.replace(/\D/g, "")

      // ============================================
      // PASSO 4: Salvar TODOS os dados de uma vez no banco
      // Esta é a ÚNICA chamada que salva dados na tabela users
      // Todos os campos são salvos em uma única transação
      // Usando o cliente Supabase diretamente (RLS protege os dados)
      // ============================================
      
      // Preparar dados para atualização
      const updateData: any = {
        // Dados da Etapa 1: Perfil
        nome: nome.trim(),
        
        // Dados da Etapa 2: Financeiros
        renda_mensal: rendaMensal,
        meta_economia_mensal: metaEconomiaMensal,
        dia_pagamento: diaPagamentoNum,
        telefone: whatsappLimpo,
        
        // Dados da Etapa 3: IA
        ativar_ia_whatsapp: ativarIA,
        
        // Status do onboarding
        onboarding_completo: true,
      }

      // Adicionar campos opcionais
      if (fotoUrl) {
        updateData.avatar_url = fotoUrl
      }

      if (profissao.trim()) {
        updateData.profissao = profissao.trim()
      }

      // Atualizar tabela users
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id)

      if (updateError) {
        console.error("Erro ao salvar dados:", updateError)
        toast({
          variant: "destructive",
          title: "Erro ao salvar dados",
          description: updateError.message || "Tente novamente.",
        })
        setLoading(false)
        return
      }

      // Atualizar user_metadata do Supabase Auth
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          onboarding_completo: true,
          nome: nome.trim(),
          avatar_url: fotoUrl || null,
          ativar_ia_whatsapp: ativarIA,
          profissao: profissao.trim() || null,
        },
      })

      if (metadataError) {
        console.warn("Erro ao atualizar metadata (não crítico):", metadataError)
        // Não bloqueia o onboarding se o metadata falhar
      }

      // Sucesso! Mostrar toast e redirecionar
      toast({
        variant: "success",
        title: "Onboarding concluído! 🎉",
        description: "Seus dados foram salvos com sucesso.",
      })

      // Pequeno delay para o usuário ver a mensagem de sucesso
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Erro:", error)
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Erro ao finalizar onboarding. Tente novamente.",
      })
      setLoading(false)
    }
  }

  // Mostrar loading enquanto verifica o status
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Esquerda - Fundo Escuro */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 bg-slate-950 relative overflow-hidden">
        {/* Padrão de ondas no topo */}
        <div className="absolute top-0 left-0 right-0 h-32">
          <svg
            className="absolute bottom-0 w-full"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="rgb(15 23 42)"
              className="opacity-20"
            />
          </svg>
        </div>

        {/* Padrão diagonal */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.1) 10px,
              rgba(255, 255, 255, 0.1) 20px
            )`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-8">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
                C
              </div>
              <span className="font-display text-2xl font-bold text-white">CONTRAL</span>
            </div>
          </div>

          {/* Título e Descrição */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Vamos começar! 🚀
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Complete seu perfil para personalizar sua experiência e começar a controlar suas finanças de forma inteligente.
            </p>
          </div>

          {/* Cards das Etapas */}
          <div className="flex-1 flex flex-col gap-4">
            {STEPS.map((step) => {
              const IconComponent = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const canClick = step.id <= currentStep || (step.id === currentStep + 1 && canProceed[currentStep])

              return (
                <button
                  key={step.id}
                  onClick={() => canClick && handleStepClick(step.id as Step)}
                  disabled={!canClick}
                  className={cn(
                    "relative flex items-center gap-4 p-6 rounded-lg border-2 transition-all duration-300 text-left",
                    isActive
                      ? "bg-white border-emerald-500 shadow-2xl scale-105 translate-x-2 z-10"
                      : isCompleted
                      ? "bg-slate-900 border-slate-700 hover:border-slate-600"
                      : "bg-slate-900 border-slate-700 opacity-60 cursor-not-allowed",
                    canClick && !isActive && "hover:border-slate-600 hover:opacity-100"
                  )}
                >
                  {/* Barra lateral colorida */}
                  <div
                    className={cn(
                      "absolute right-0 top-0 bottom-0 w-1 rounded-r-lg transition-colors",
                      isActive ? "bg-emerald-500" : "bg-slate-700"
                    )}
                  />

                  {/* Ícone */}
                  <div
                    className={cn(
                      "flex-shrink-0 p-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-800 text-slate-400"
                    )}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <h3
                      className={cn(
                        "font-semibold text-lg mb-1 transition-colors",
                        isActive ? "text-slate-900" : "text-white"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        "text-sm transition-colors",
                        isActive ? "text-slate-600" : "text-slate-400"
                      )}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Check de completado */}
                  {isCompleted && (
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Card Branco à Direita - Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto bg-slate-50">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all",
                    currentStep === step.id
                      ? "bg-slate-900 text-white border-slate-900 scale-110"
                      : currentStep > step.id
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-slate-400 border-slate-300"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    `0${step.id}`
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2 transition-colors",
                      currentStep > step.id ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Conteúdo do Formulário */}
          <div className="space-y-8">
            {/* Etapa 1: Informações de Perfil */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Informações de Perfil
                  </h2>
                  <p className="text-slate-600">
                    Vamos começar com suas informações pessoais.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Foto de Perfil */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-sm font-medium">
                      Foto de Perfil
                    </Label>
                    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                      <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                          <AvatarImage src={fotoPerfil || ""} alt="Foto de perfil" />
                          <AvatarFallback className="bg-slate-200 text-slate-500 text-4xl">
                            {nome ? nome.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={handleFotoClick}
                          className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center border-4 border-white shadow-lg transition-colors"
                        >
                          <Camera className="h-5 w-5 text-white" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          className="hidden"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          {fotoPerfil ? "Foto adicionada" : "Adicione sua foto de perfil"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Clique no ícone da câmera para {fotoPerfil ? "alterar" : "adicionar"} sua foto
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-slate-700 text-sm font-medium">
                      Nome completo *
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Profissão */}
                  <div className="space-y-2">
                    <Label htmlFor="profissao" className="text-slate-700 text-sm font-medium">
                      Profissão
                    </Label>
                    <Input
                      id="profissao"
                      type="text"
                      value={profissao}
                      onChange={(e) => setProfissao(e.target.value)}
                      placeholder="Sua profissão ou área de atuação"
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500">
                      Opcional - Ajuda a personalizar insights financeiros
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Dados Financeiros */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Dados Financeiros
                  </h2>
                  <p className="text-slate-600">
                    Configure suas informações financeiras para personalizar sua experiência.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Renda Mensal */}
                  <div className="space-y-2">
                    <Label htmlFor="renda" className="text-slate-700 text-sm font-medium">
                      Renda Mensal *
                    </Label>
                    <Select value={rendaFaixa} onValueChange={setRendaFaixa}>
                      <SelectTrigger
                        id="renda"
                        className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                      >
                        <SelectValue placeholder="Selecione uma faixa" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {RENDA_FAIXAS.map((faixa) => (
                          <SelectItem
                            key={faixa.value}
                            value={faixa.value}
                            className="text-slate-900 focus:bg-slate-100"
                          >
                            {faixa.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Meta de Economia */}
                  <div className="space-y-2">
                    <Label htmlFor="meta" className="text-slate-700 text-sm font-medium">
                      Meta de Economia Mensal *
                    </Label>
                    <Select
                      value={metaEconomiaFaixa}
                      onValueChange={setMetaEconomiaFaixa}
                    >
                      <SelectTrigger
                        id="meta"
                        className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                      >
                        <SelectValue placeholder="Selecione uma meta" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {META_ECONOMIA_FAIXAS.map((faixa) => (
                          <SelectItem
                            key={faixa.value}
                            value={faixa.value}
                            className="text-slate-900 focus:bg-slate-100"
                          >
                            {faixa.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-slate-700 text-sm font-medium">
                      Número de WhatsApp *
                    </Label>
                    <Input
                      id="whatsapp"
                      type="text"
                      value={whatsapp}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="h-12 bg-white border-slate-300 text-slate-900 text-base focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500">
                      Usado para enviar lembretes e insights importantes
                    </p>
                  </div>

                  {/* Dia do Pagamento */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-sm font-medium">
                      Dia do Pagamento *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal text-base bg-white border-slate-300 text-slate-900 hover:bg-slate-50",
                            !diaPagamento && "text-slate-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-5 w-5" />
                          {diaPagamento ? (
                            `Dia ${diaPagamento.getDate()}`
                          ) : (
                            <span>Selecione o dia do mês</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-slate-200" align="start">
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
                          className="bg-white"
                          classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-medium text-slate-900",
                            nav: "space-x-1 flex items-center",
                            nav_button: cn(
                              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-900 border border-slate-300 hover:bg-slate-100 rounded-md"
                            ),
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: cn(
                              "h-9 w-9 p-0 font-normal text-slate-900 hover:bg-slate-100 rounded-md aria-selected:opacity-100"
                            ),
                            day_range_end: "day-range-end",
                            day_selected:
                              "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white focus:bg-emerald-600 focus:text-white",
                            day_today: "bg-slate-200 text-slate-900 font-semibold",
                            day_outside:
                              "day-outside text-slate-400 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-400 aria-selected:opacity-30",
                            day_disabled: "text-slate-300 opacity-50",
                            day_range_middle:
                              "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                            day_hidden: "invisible",
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-slate-500">
                      Para lembretes automáticos de pagamentos
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 3: Assistente de IA */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Conheça seu Assistente de IA
                  </h2>
                  <p className="text-slate-600">
                    Seu assistente inteligente via WhatsApp está pronto para ajudar!
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Card de Explicação */}
                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-emerald-500 rounded-lg">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          Como funciona?
                        </h3>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          Envie mensagens para o número do CONTRAL no WhatsApp e receba insights instantâneos sobre suas finanças. 
                          Pergunte sobre gastos, receitas, metas e muito mais!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exemplos de Uso */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Exemplos de uso:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: Sparkles, text: "Quanto gastei este mês?" },
                        { icon: Sparkles, text: "Estou dentro da meta?" },
                        { icon: Sparkles, text: "Quais são minhas maiores despesas?" },
                        { icon: Sparkles, text: "Me mostre um resumo financeiro" },
                      ].map((exemplo, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex-shrink-0 p-2 bg-emerald-100 rounded-lg">
                            <exemplo.icon className="h-4 w-4 text-emerald-600" />
                          </div>
                          <p className="text-sm text-slate-700">{exemplo.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ativação */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <input
                        id="ativar-ia"
                        type="checkbox"
                        checked={ativarIA}
                        onChange={(e) => setAtivarIA(e.target.checked)}
                        className="h-5 w-5 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                      <Label htmlFor="ativar-ia" className="text-slate-700 cursor-pointer text-base font-medium">
                        Quero receber insights e lembretes via WhatsApp
                      </Label>
                    </div>
                    <p className="text-sm text-slate-500 pl-8">
                      Você receberá notificações automáticas sobre suas finanças e poderá interagir com o assistente a qualquer momento.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Navegação */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="h-12 px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <div className="flex-1" />
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed[currentStep] || loading}
                className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={loading}
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Finalizando..." : "Finalizar 🎉"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Crop de Imagem */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-2xl w-full p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Editar Foto de Perfil
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Ajuste o tamanho e posicionamento da sua foto. Arraste para mover e use o zoom para aproximar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative w-full h-[400px] bg-slate-900">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
                style={{
                  containerStyle: {
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  },
                }}
              />
            )}
          </div>

          {/* Controles de Zoom */}
          <div className="px-6 py-4 border-t border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <Label className="text-sm font-medium text-slate-700 min-w-[60px]">
                Zoom:
              </Label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-sm text-slate-600 min-w-[40px] text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelCrop}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCropComplete}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
