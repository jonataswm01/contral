"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, TrendingUp, BarChart3, Wallet, Bell, Shield, Zap, CheckCircle2, ArrowRight, Sparkles, XCircle, Smartphone, AlertCircle, TrendingDown, DollarSign, Calendar, PieChart, Target, ChevronDown } from "lucide-react"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />

      {/* Header */}
      <header className="container relative z-20 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
              C
            </div>
            <span className="font-display text-xl font-bold text-white">CONTRAL</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
              Entrar
            </Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/cadastro">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Inspirado na Bizu.ai */}
      <section className="container relative z-10 flex flex-col items-center justify-center gap-12 py-20 md:py-32">
        <div className="flex flex-col items-center gap-8 text-center max-w-6xl">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Seu dinheiro já sabe pra onde vai.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Nós mostramos como controlar.
            </span>
          </h1>
          
          <p className="max-w-3xl text-xl md:text-2xl text-slate-300 font-light leading-relaxed">
            Converse naturalmente pelo WhatsApp, registre gastos em segundos e acompanhe tudo em um dashboard visual. 
            Controle total das suas finanças, sem complicação.
          </p>

          {/* Features Icons */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg backdrop-blur-xl bg-blue-500/10 border border-blue-500/20">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">WhatsApp</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">IA Inteligente</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-lg backdrop-blur-xl bg-purple-500/10 border border-purple-500/20">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Dashboard</span>
            </div>
          </div>

          {/* Floating Cards - Simulando WhatsApp */}
          <div className="relative w-full max-w-4xl mt-12">
            {/* Card 1 - Exemplo de mensagem */}
            <div className="absolute -top-10 -left-10 backdrop-blur-2xl bg-slate-900/60 border border-blue-500/30 rounded-2xl p-4 shadow-2xl transform rotate-[-2deg] hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30"></div>
                <span className="text-xs text-slate-400">CONTRAL</span>
              </div>
              <p className="text-sm text-blue-300 font-mono">"Gastei 45 reais no almoço"</p>
              <p className="text-xs text-emerald-400 mt-2">✓ Registrado em Alimentação</p>
            </div>

            {/* Card 2 - Insight */}
            <div className="absolute top-20 right-0 backdrop-blur-2xl bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl transform rotate-[2deg] hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Insight do Mês</span>
              </div>
              <p className="text-sm text-white">Você gastou 23% menos que no mês passado! 🎉</p>
            </div>

            {/* Card 3 - Saldo */}
            <div className="absolute -bottom-10 left-1/4 backdrop-blur-2xl bg-slate-900/60 border border-purple-500/30 rounded-2xl p-4 shadow-2xl transform rotate-[-1deg] hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">Saldo Atual</span>
              </div>
              <p className="text-lg font-bold text-white">R$ 1.250,00</p>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 h-auto shadow-2xl">
              <Link href="/cadastro" className="flex items-center gap-3">
                TESTAR AGORA MESMO
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <span>💳</span> Nenhum cartão de crédito necessário.
            </p>
          </div>
        </div>
      </section>

      {/* Seção: Por que seu dinheiro continua sumindo? */}
      <section className="container relative z-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Por que seu dinheiro continua sumindo?
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Todo dia você gasta, mas não sabe exatamente onde. Essas informações se perdem no dia a dia. 
              O CONTRAL transforma esses dados invisíveis em controle real das suas finanças.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Gastos invisíveis
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Você não sabe onde está gastando mais — e descobre tarde demais quando o dinheiro acaba.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Falta de controle
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Apps complicados e planilhas chatas fazem você desistir antes mesmo de começar.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-4">
                <TrendingDown className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Sem métricas reais
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Sem entender o que gasta, onde economiza e quanto sobra, é impossível melhorar.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Metas esquecidas
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Você define metas de economia, mas não tem como acompanhar se está no caminho certo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Como o CONTRAL transforma suas conversas em controle */}
      <section className="container relative z-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Como o CONTRAL transforma suas conversas em controle
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Em três passos simples, você entende para onde vai seu dinheiro e descobre como economizar mais, 
              sem precisar ser especialista em finanças.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Passo 1 */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/30 border-2 border-blue-500/50 flex items-center justify-center mb-6">
                <Smartphone className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                Envie mensagem para o CONTRAL
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Adicione o número do CONTRAL no WhatsApp e comece a enviar suas despesas e receitas. É simples, rápido e funciona direto no WhatsApp que você já usa.
              </p>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                  <span className="text-xs text-slate-400">CONTRAL</span>
                </div>
                <p className="text-sm text-blue-300">Olá! Pronto para começar? 👋</p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/30 border-2 border-emerald-500/50 flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                A IA organiza tudo
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Nossa inteligência artificial entende suas mensagens, identifica gastos e receitas, e organiza tudo automaticamente por categoria.
              </p>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20"></div>
                  <span className="text-xs text-slate-400">Você</span>
                </div>
                <p className="text-sm text-white">"Gastei 50 no Uber"</p>
                <p className="text-xs text-emerald-400 mt-2">✓ Registrado em Transporte</p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-slate-900/60 to-slate-900/60 border-2 border-blue-500/40 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/30 border-2 border-purple-500/50 flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                Receba insights prontos
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                O CONTRAL traduz seus dados em insights práticos: alertas de gastos, comparações mensais e recomendações para economizar.
              </p>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Insight</span>
                </div>
                <p className="text-sm text-white">Você está 15% abaixo da meta de gastos! 🎯</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 h-auto shadow-2xl">
              <Link href="/cadastro" className="flex items-center gap-3">
                TESTAR AGORA MESMO
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
              <span>💳</span> Nenhum cartão de crédito necessário.
            </p>
          </div>
        </div>
      </section>

      {/* Seção: Veja o que o CONTRAL tem a dizer sobre suas finanças - Inspirado nos bizus */}
      <section className="container relative z-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Veja o que o CONTRAL tem a dizer sobre suas finanças
            </h2>
          </div>

          <div className="text-center mb-16">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-12 py-8 h-auto shadow-2xl">
              <Link href="/cadastro" className="flex items-center gap-3">
                TESTAR AGORA MESMO
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
              <span>💳</span> Nenhum cartão de crédito necessário.
            </p>
          </div>
        </div>
      </section>

      {/* Seção: Veja o CONTRAL em ação - Grid de Insights */}
      <section className="container relative z-10 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Veja o CONTRAL em ação
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-slate-300 leading-relaxed">
              Transformamos suas conversas do WhatsApp em insights práticos para controlar gastos, 
              economizar mais e alcançar suas metas financeiras.
            </p>
          </div>

          {/* Grid de Insights - Similar aos bizus da Bizu.ai */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Insight 1 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-orange-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-300">Alerta de Gastos</span>
              </div>
              <p className="text-white font-semibold mb-2">Você atingiu 80% da meta de gastos</p>
              <p className="text-slate-400 text-sm">Ajuste os gastos para não ultrapassar o limite este mês</p>
            </div>

            {/* Insight 2 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Tendência Detectada</span>
              </div>
              <p className="text-white font-semibold mb-2">"Alimentação" mencionado 45 vezes este mês</p>
              <p className="text-slate-400 text-sm">Considere criar um orçamento específico para essa categoria</p>
            </div>

            {/* Insight 3 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-blue-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">Conta a Vencer</span>
              </div>
              <p className="text-white font-semibold mb-2">Netflix vence em 3 dias</p>
              <p className="text-slate-400 text-sm">Lembrete automático: R$ 39,90 será descontado</p>
            </div>

            {/* Insight 4 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-purple-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-5 w-5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">Análise de Categoria</span>
              </div>
              <p className="text-white font-semibold mb-2">Transporte representa 35% dos gastos</p>
              <p className="text-slate-400 text-sm">Avalie alternativas para reduzir custos de deslocamento</p>
            </div>

            {/* Insight 5 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Meta Alcançada</span>
              </div>
              <p className="text-white font-semibold mb-2">Você economizou R$ 500 este mês</p>
              <p className="text-slate-400 text-sm">Parabéns! Você está 25% acima da meta de economia</p>
            </div>

            {/* Insight 6 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-yellow-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-300">Padrão Detectado</span>
              </div>
              <p className="text-white font-semibold mb-2">Gastos aumentam 40% aos finais de semana</p>
              <p className="text-slate-400 text-sm">Planeje melhor os gastos de lazer para manter o controle</p>
            </div>

            {/* Insight 7 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-blue-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">Comparação Mensal</span>
              </div>
              <p className="text-white font-semibold mb-2">Gastou 18% menos que no mês passado</p>
              <p className="text-slate-400 text-sm">Continue assim! Você está no caminho certo</p>
            </div>

            {/* Insight 8 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-red-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-xs font-semibold text-red-300">Atenção</span>
              </div>
              <p className="text-white font-semibold mb-2">Saldo abaixo do esperado para esta data</p>
              <p className="text-slate-400 text-sm">Revise os gastos para garantir que sobrará dinheiro até o fim do mês</p>
            </div>

            {/* Insight 9 */}
            <div className="backdrop-blur-xl bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Oportunidade</span>
              </div>
              <p className="text-white font-semibold mb-2">Você pode economizar R$ 200 este mês</p>
              <p className="text-slate-400 text-sm">Reduzindo gastos com "Lazer" em 30%, você alcança a meta</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container relative z-10 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white text-center mb-6">
            Perguntas Frequentes
          </h2>
          <p className="text-center text-slate-400 mb-12">
            Não encontrou o que procurava? Entre em contato, ficaremos felizes em ajudar.
          </p>
          
          <div className="space-y-3">
            {[
              {
                q: "Preciso ser especialista em finanças para usar o CONTRAL?",
                a: "Não! O CONTRAL foi feito para pessoas que querem controlar suas finanças de forma simples. Se você sabe mandar mensagem no WhatsApp, você sabe usar o CONTRAL. A IA faz todo o trabalho pesado de organização e análise."
              },
              {
                q: "Como o CONTRAL funciona com WhatsApp?",
                a: "Você simplesmente envia mensagens para o número do CONTRAL no WhatsApp informando seus gastos e receitas. Nossa IA processa essas mensagens e organiza tudo automaticamente. Não é necessário conectar ou integrar nada - apenas envie mensagens normalmente."
              },
              {
                q: "É seguro usar o CONTRAL?",
                a: "Sim! O CONTRAL usa as mesmas tecnologias de segurança dos principais serviços financeiros. Seus dados são criptografados e nunca compartilhamos informações com terceiros. Privacidade é uma das nossas prioridades."
              },
              {
                q: "Que tipos de pessoas podem usar o CONTRAL?",
                a: "Qualquer pessoa que queira controlar melhor suas finanças! Se você já tentou usar apps complicados ou planilhas e desistiu, o CONTRAL é perfeito para você. É simples, rápido e funciona direto no WhatsApp que você já usa todo dia."
              },
              {
                q: "Como os insights ajudam minhas finanças?",
                a: "Os insights do CONTRAL mostram padrões que você não perceberia sozinho: onde está gastando mais, quando gasta mais, se está no caminho certo para suas metas. Com essas informações, você toma decisões melhores sobre seu dinheiro."
              },
              {
                q: "O CONTRAL é realmente gratuito?",
                a: "Sim! O CONTRAL é 100% gratuito. Não cobramos mensalidade, não temos planos premium escondidos. Você tem acesso completo a todas as funcionalidades sem pagar nada. Sem pegadinhas, sem surpresas."
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-slate-900/50 border border-slate-800/50 rounded-xl shadow-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <h3 className="font-display text-lg md:text-xl font-bold text-white pr-4">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform ${
                      openFaq === i ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 relative z-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
                  C
                </div>
                <span className="font-display text-xl font-bold text-white">CONTRAL</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Transformamos suas conversas do WhatsApp em controle total das suas finanças. 
                Todo mundo merece ter controle do próprio dinheiro.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="flex flex-col gap-2 text-sm text-slate-400">
                <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
                <Link href="#" className="hover:text-white transition-colors">Política de Privacidade</Link>
                <Link href="#" className="hover:text-white transition-colors">Política de Cookies</Link>
                <Link href="#" className="hover:text-white transition-colors">LGPD</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} CONTRAL. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
