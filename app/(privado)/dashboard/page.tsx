import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

export default function DashboardPage() {
  // TODO: Buscar dados reais do Supabase
  const receitasMes = 5000
  const despesasMes = 3200
  const saldoAtual = receitasMes - despesasMes

  return (
    <div className="container py-8 space-y-8">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(receitasMes)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(despesasMes)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                saldoAtual >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {formatCurrency(saldoAtual)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Pizza - TODO: Implementar com Recharts */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Gráfico de Pizza será implementado aqui
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Avisos */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas e Avisos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum alerta no momento.
          </p>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex gap-4">
        {/* TODO: Implementar modals para adicionar transações */}
        <p className="text-sm text-muted-foreground">
          Botões de ação rápida serão implementados aqui
        </p>
      </div>
    </div>
  )
}

