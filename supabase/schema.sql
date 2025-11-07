-- ============================================
-- SCHEMA DO CONTRAL - SUPABASE
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: perfis
-- Armazena dados adicionais do usuário além do auth.users
-- ============================================
CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT,
  telefone TEXT,
  foto_url TEXT,
  renda_mensal DECIMAL(10, 2),
  dia_pagamento INTEGER CHECK (dia_pagamento >= 1 AND dia_pagamento <= 31),
  meta_gastos_mensal DECIMAL(10, 2),
  meta_economia_mensal DECIMAL(10, 2),
  lembrete_diario_ativo BOOLEAN DEFAULT true,
  lembrete_horario TIME DEFAULT '20:00:00',
  lembrete_dias_semana INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Segunda, 7=Domingo
  onboarding_completo BOOLEAN DEFAULT false,
  trial_inicio TIMESTAMP WITH TIME ZONE,
  trial_fim TIMESTAMP WITH TIME ZONE,
  assinatura_ativa BOOLEAN DEFAULT false,
  assinatura_inicio TIMESTAMP WITH TIME ZONE,
  proxima_cobranca TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: categorias
-- Categorias de despesas e receitas
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('despesa', 'receita')),
  icone TEXT NOT NULL, -- Nome do ícone do Lucide React
  cor TEXT NOT NULL, -- Cor em formato hex (#FF5733)
  e_padrao BOOLEAN DEFAULT false, -- Se é categoria padrão do sistema
  ordem INTEGER DEFAULT 0, -- Para ordenação personalizada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, nome, tipo)
);

-- ============================================
-- TABELA: contas
-- Contas do usuário (Carteira, Banco, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS contas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('carteira', 'banco', 'poupanca', 'investimento', 'outro')),
  saldo_inicial DECIMAL(10, 2) DEFAULT 0,
  e_padrao BOOLEAN DEFAULT false, -- Conta padrão para novas transações
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, nome)
);

-- ============================================
-- TABELA: transacoes
-- Todas as despesas e receitas
-- ============================================
CREATE TABLE IF NOT EXISTS transacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('despesa', 'receita')),
  valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  conta_id UUID NOT NULL REFERENCES contas(id) ON DELETE RESTRICT,
  data_transacao DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  criado_via TEXT DEFAULT 'webapp' CHECK (criado_via IN ('webapp', 'whatsapp')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: contas_fixas
-- Contas recorrentes (Netflix, aluguel, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS contas_fixas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  dias_antes_aviso INTEGER DEFAULT 3 CHECK (dias_antes_aviso >= 0),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: pagamentos_contas_fixas
-- Histórico de pagamentos das contas fixas
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos_contas_fixas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conta_fixa_id UUID NOT NULL REFERENCES contas_fixas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor_pago DECIMAL(10, 2),
  pago BOOLEAN DEFAULT false,
  transacao_id UUID REFERENCES transacoes(id) ON DELETE SET NULL, -- Se foi criada uma transação
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario_data ON transacoes(usuario_id, data_transacao DESC);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta ON transacoes(conta_id);
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_contas_usuario ON contas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_contas_fixas_usuario ON contas_fixas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_conta_fixa ON pagamentos_contas_fixas(conta_fixa_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_fixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_contas_fixas ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON perfis FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON perfis FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON perfis FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas para categorias
CREATE POLICY "Usuários podem ver suas próprias categorias"
  ON categorias FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias categorias"
  ON categorias FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias"
  ON categorias FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias categorias"
  ON categorias FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para contas
CREATE POLICY "Usuários podem ver suas próprias contas"
  ON contas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias contas"
  ON contas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias contas"
  ON contas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias contas"
  ON contas FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para transacoes
CREATE POLICY "Usuários podem ver suas próprias transações"
  ON transacoes FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias transações"
  ON transacoes FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações"
  ON transacoes FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias transações"
  ON transacoes FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para contas_fixas
CREATE POLICY "Usuários podem ver suas próprias contas fixas"
  ON contas_fixas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias contas fixas"
  ON contas_fixas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias contas fixas"
  ON contas_fixas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias contas fixas"
  ON contas_fixas FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para pagamentos_contas_fixas
CREATE POLICY "Usuários podem ver seus próprios pagamentos"
  ON pagamentos_contas_fixas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar seus próprios pagamentos"
  ON pagamentos_contas_fixas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar seus próprios pagamentos"
  ON pagamentos_contas_fixas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar seus próprios pagamentos"
  ON pagamentos_contas_fixas FOR DELETE
  USING (auth.uid() = usuario_id);

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_updated_at BEFORE UPDATE ON contas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_fixas_updated_at BEFORE UPDATE ON contas_fixas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos_contas_fixas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: Criar categorias padrão para novo usuário
-- ============================================
CREATE OR REPLACE FUNCTION criar_categorias_padrao(usuario_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Categorias de despesas padrão
  INSERT INTO categorias (usuario_id, nome, tipo, icone, cor, e_padrao, ordem) VALUES
    (usuario_uuid, 'Alimentação', 'despesa', 'UtensilsCrossed', '#EF4444', true, 1),
    (usuario_uuid, 'Transporte', 'despesa', 'Car', '#F97316', true, 2),
    (usuario_uuid, 'Moradia', 'despesa', 'Home', '#8B5CF6', true, 3),
    (usuario_uuid, 'Lazer', 'despesa', 'Gamepad2', '#EC4899', true, 4),
    (usuario_uuid, 'Saúde', 'despesa', 'Heart', '#F43F5E', true, 5),
    (usuario_uuid, 'Educação', 'despesa', 'GraduationCap', '#3B82F6', true, 6),
    (usuario_uuid, 'Outros', 'despesa', 'MoreHorizontal', '#6B7280', true, 7);

  -- Categorias de receitas padrão
  INSERT INTO categorias (usuario_id, nome, tipo, icone, cor, e_padrao, ordem) VALUES
    (usuario_uuid, 'Salário', 'receita', 'Briefcase', '#10B981', true, 1),
    (usuario_uuid, 'Freelance', 'receita', 'Code', '#14B8A6', true, 2),
    (usuario_uuid, 'Investimentos', 'receita', 'TrendingUp', '#059669', true, 3),
    (usuario_uuid, 'Outros', 'receita', 'MoreHorizontal', '#6B7280', true, 4);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: Criar conta padrão "Carteira" para novo usuário
-- ============================================
CREATE OR REPLACE FUNCTION criar_conta_padrao(usuario_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO contas (usuario_id, nome, tipo, saldo_inicial, e_padrao)
  VALUES (usuario_uuid, 'Carteira', 'carteira', 0, true);
END;
$$ LANGUAGE plpgsql;

