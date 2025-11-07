import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, TrendingUp, BarChart3 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-6 py-20 md:py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Pare de Perder o Controle
            <br />
            <span className="text-primary">do Seu Dinheiro</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Gestão financeira simples e direta, direto no seu WhatsApp. 
            Anote gastos conversando naturalmente e acompanhe tudo em um dashboard visual.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/cadastro">Começar Grátis por 5 Dias</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="container py-20">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Como Funciona
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>1. Cadastre-se e Configure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crie sua conta, defina suas metas financeiras e configure suas categorias em poucos minutos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>2. Converse com o CONTRAL</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Adicione o bot do CONTRAL no WhatsApp e anote seus gastos conversando naturalmente. 
                "Gastei 50 no Uber" e pronto!
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>3. Acompanhe no Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize gráficos, relatórios e insights automáticos sobre seus gastos. 
                Tudo sincronizado em tempo real.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefícios */}
      <section className="container py-20 bg-muted/50 rounded-lg">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Por que escolher o CONTRAL?
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sem Complicação</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Anote gastos conversando naturalmente, sem precisar abrir apps complicados.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lembretes Inteligentes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Nunca esqueça de anotar um gasto ou pagar uma conta. Receba lembretes automáticos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insights Automáticos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Descubra para onde vai seu dinheiro com análises e gráficos automáticos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visual e Bonito</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Dashboard moderno com gráficos que fazem sentido e ajudam na tomada de decisão.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Preço */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Preço Transparente
          </h2>
          <div className="mb-8">
            <div className="text-5xl font-bold mb-2">R$ 9,90<span className="text-lg text-muted-foreground">/mês</span></div>
            <p className="text-lg text-muted-foreground">
              5 dias grátis para testar • Cancele quando quiser, sem multa
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/cadastro">Começar Agora</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
              C
            </div>
            <span className="font-display text-lg font-bold">CONTRAL</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Termos de Uso</Link>
            <Link href="#" className="hover:text-foreground">Política de Privacidade</Link>
            <Link href="#" className="hover:text-foreground">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

