import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Faixas de renda (mesmas do frontend)
const RENDA_FAIXAS = [
  { value: "0-1000", media: 500 },
  { value: "1000-2000", media: 1500 },
  { value: "2000-3000", media: 2500 },
  { value: "3000-5000", media: 4000 },
  { value: "5000-10000", media: 7500 },
  { value: "10000+", media: 12000 },
]

// Faixas de meta de economia (mesmas do frontend)
const META_ECONOMIA_FAIXAS = [
  { value: "0-500", media: 250 },
  { value: "500-1000", media: 750 },
  { value: "1000-2000", media: 1500 },
  { value: "2000-3000", media: 2500 },
  { value: "3000+", media: 4000 },
]

interface OnboardingData {
  nome: string
  profissao?: string
  rendaFaixa: string
  metaEconomiaFaixa: string
  whatsapp: string
  diaPagamento: number
  ativarIA: boolean
  avatarUrl?: string // URL da foto já processada (se houver)
}

export async function POST(request: NextRequest) {
  try {
    // Criar cliente Supabase com cookies da requisição
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Configuração do servidor inválida" },
        { status: 500 }
      )
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
        },
      },
    })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Debug: log dos cookies recebidos
    console.log("Cookies recebidos:", request.cookies.getAll().map(c => c.name))
    console.log("Auth error:", authError)
    console.log("User:", user?.id)

    if (authError || !user) {
      // Tentar obter sessão como fallback
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        return NextResponse.json(
          { 
            error: "Não autenticado",
            details: authError?.message || sessionError?.message || "Nenhuma sessão encontrada"
          },
          { status: 401 }
        )
      }
      
      // Usar usuário da sessão
      const finalUser = session.user
      
      // Continuar com o processamento usando finalUser
      // (o código abaixo será executado com finalUser em vez de user)
      const body: OnboardingData = await request.json()
      
      // ... resto do código será movido para uma função auxiliar ou continuará aqui
      // Por enquanto, vamos usar uma abordagem diferente
    }

    // Verificar se já completou o onboarding
    const { data: existingUser } = await supabase
      .from("users")
      .select("onboarding_completo")
      .eq("id", user.id)
      .single()

    if (existingUser?.onboarding_completo) {
      return NextResponse.json(
        { error: "Onboarding já foi completado" },
        { status: 400 }
      )
    }

    // Parse do body
    const body: OnboardingData = await request.json()

    // Validações
    if (!body.nome || body.nome.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    if (!body.rendaFaixa) {
      return NextResponse.json(
        { error: "Renda mensal é obrigatória" },
        { status: 400 }
      )
    }

    if (!body.metaEconomiaFaixa) {
      return NextResponse.json(
        { error: "Meta de economia é obrigatória" },
        { status: 400 }
      )
    }

    if (!body.whatsapp || body.whatsapp.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "WhatsApp inválido" },
        { status: 400 }
      )
    }

    if (!body.diaPagamento || body.diaPagamento < 1 || body.diaPagamento > 31) {
      return NextResponse.json(
        { error: "Dia de pagamento inválido" },
        { status: 400 }
      )
    }

    // Calcular valores numéricos
    const rendaMensal =
      RENDA_FAIXAS.find((f) => f.value === body.rendaFaixa)?.media || 0
    const metaEconomiaMensal =
      META_ECONOMIA_FAIXAS.find((f) => f.value === body.metaEconomiaFaixa)
        ?.media || 0

    // Limpar telefone
    const telefoneLimpo = body.whatsapp.replace(/\D/g, "")

    // ============================================
    // PREPARAR TODOS OS DADOS PARA SALVAMENTO
    // Todos os dados das 3 etapas são preparados aqui
    // e salvos de UMA VEZ SÓ na tabela users
    // ============================================
    const updateData: any = {
      // Dados da Etapa 1: Perfil
      nome: body.nome.trim(),
      
      // Dados da Etapa 2: Financeiros
      renda_mensal: rendaMensal,
      meta_economia_mensal: metaEconomiaMensal,
      dia_pagamento: body.diaPagamento,
      telefone: telefoneLimpo,
      
      // Dados da Etapa 3: IA
      ativar_ia_whatsapp: body.ativarIA ?? true,
      
      // Status do onboarding
      onboarding_completo: true,
    }

    // Adicionar campos opcionais se fornecidos
    if (body.avatarUrl) {
      updateData.avatar_url = body.avatarUrl
    }

    if (body.profissao && body.profissao.trim().length > 0) {
      updateData.profissao = body.profissao.trim()
    }

    // ============================================
    // SALVAR TODOS OS DADOS DE UMA VEZ
    // Esta é a ÚNICA operação de UPDATE na tabela users
    // Todos os campos são atualizados em uma única transação
    // ============================================
    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)

    if (updateError) {
      console.error("Erro ao atualizar tabela users:", updateError)
      return NextResponse.json(
        {
          error: "Erro ao salvar dados",
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    // Atualizar user_metadata do Supabase Auth
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        onboarding_completo: true,
        nome: body.nome.trim(),
        avatar_url: body.avatarUrl || null,
        ativar_ia_whatsapp: body.ativarIA ?? true,
        profissao: body.profissao?.trim() || null,
      },
    })

    if (metadataError) {
      console.error("Erro ao atualizar metadata:", metadataError)
      // Não falha a requisição, apenas loga o erro
    }

    // Criar resposta com cookies atualizados
    const response = NextResponse.json({
      success: true,
      message: "Onboarding completado com sucesso",
    })

    // Copiar cookies atualizados para a resposta
    const cookies = request.cookies.getAll()
    cookies.forEach(({ name, value }) => {
      response.cookies.set(name, value)
    })

    return response
  } catch (error: any) {
    console.error("Erro ao processar onboarding:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

