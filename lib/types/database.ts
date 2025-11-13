// Tipos TypeScript baseados no schema real do banco de dados

export type TipoTransacao = 'despesa' | 'receita'
export type TipoCategoria = 'despesa' | 'receita'
export type TipoConta = 'carteira' | 'banco' | 'poupanca' | 'investimento' | 'outro'
export type OrigemTransacao = 'whatsapp' | 'webapp'
export type StatusPagamento = 'pendente' | 'pago' | 'atrasado'
export type TipoInsight = 'alerta' | 'tendencia' | 'oportunidade' | 'meta'

export interface User {
  id: string
  email: string
  nome: string
  telefone: string
  senha_hash?: string
  avatar_url?: string
  renda_mensal?: number
  dia_pagamento?: number
  meta_gasto_mensal?: number
  meta_economia_mensal?: number
  assinatura_ativa: boolean
  trial_ate?: string
  stripe_customer_id?: string
  plano_id?: string
  lembrete_ativo: boolean
  horario_lembrete: string
  timezone: string
  onboarding_completo: boolean
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  user_id: string
  nome: string
  tipo: TipoCategoria
  cor: string
  icone?: string
  is_padrao: boolean
  ordem: number
  created_at: string
}

export interface Conta {
  id: string
  user_id: string
  nome: string
  tipo: TipoConta
  banco?: string
  saldo_inicial: number
  saldo_atual: number
  is_ativa: boolean
  conexao_bancaria_id?: string
  created_at: string
  updated_at: string
}

export interface Transacao {
  id: string
  user_id: string
  tipo: TipoTransacao
  descricao: string
  valor: number
  data: string
  categoria_id?: string
  conta_id?: string
  is_recorrente: boolean
  recorrencia_id?: string
  observacao?: string
  tags?: string[]
  foto_comprovante?: string
  origem: OrigemTransacao
  created_at: string
  updated_at: string
}

export interface ContaFixa {
  id: string
  user_id: string
  nome: string
  valor: number
  dia_vencimento: number
  categoria_id?: string
  conta_id?: string
  is_ativa: boolean
  alerta_dias_antes: number
  proxima_data?: string
  created_at: string
  updated_at: string
}

export interface PagamentoContaFixa {
  id: string
  conta_fixa_id: string
  transacao_id?: string
  mes_referencia: string
  status: StatusPagamento
  data_pagamento?: string
  notificado: boolean
  created_at: string
}

export interface ConversaWhatsapp {
  id: string
  user_id: string
  mensagem_user: string
  mensagem_bot: string
  intent?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface InsightEnviado {
  id: string
  user_id: string
  tipo: TipoInsight
  mes_referencia: string
  conteudo: string
  enviado_em: string
}

export interface LembreteEnviado {
  id: string
  user_id: string
  data: string
  enviado: boolean
  enviado_em: string
}

export interface MetaGasto {
  id: string
  user_id: string
  categoria_id?: string
  valor_limite: number
  mes_referencia: string
  alerta_percentual: number
  notificado: boolean
  created_at: string
}

