
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleDollarSign,
  Github,
  Goal,
  Landmark,
  Linkedin,
  PiggyBank,
  ReceiptText,
  Target,
  WalletCards,
} from "lucide-react";

import MonthlyComparisonChart from "@/components/dashboard/monthly-comparison-chart";
import SummaryCards from "@/components/dashboard/summary-cards";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";
import { WishDialog } from "@/components/wishlist/create-wish-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Transaction } from "@/models/transaction.model";
import type { NewWish } from "@/models/wishlist.model";
import { formatCurrency } from "@/utils/formatters";

const monthlyData = [
  { name: "Jan", Receitas: 4800, Despesas: 2900, Saldo: 1900 },
  { name: "Fev", Receitas: 5100, Despesas: 2700, Saldo: 2400 },
  { name: "Mar", Receitas: 5200, Despesas: 3150, Saldo: 2050 },
  { name: "Abr", Receitas: 5450, Despesas: 2850, Saldo: 2600 },
  { name: "Mai", Receitas: 5600, Despesas: 3000, Saldo: 2600 },
  { name: "Jun", Receitas: 5800, Despesas: 2900, Saldo: 2900 },
];

const features = [
  {
    title: "Transações organizadas",
    description: "Registre receitas e despesas com categoria, data e descrição.",
    icon: ReceiptText,
    color: "text-blue-600 dark:text-blue-400",
    background: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    title: "Metas que saem do papel",
    description: "Acompanhe quanto já guardou para cada desejo da sua wishlist.",
    icon: Target,
    color: "text-purple-600 dark:text-purple-400",
    background: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    title: "Contas sob controle",
    description: "Lembre-se das despesas fixas e marque os pagamentos do ciclo.",
    icon: CalendarCheck2,
    color: "text-amber-600 dark:text-amber-400",
    background: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    title: "Decisões com contexto",
    description: "Visualize receitas, despesas, saldo e sua evolução mensal.",
    icon: ChartNoAxesCombined,
    color: "text-emerald-600 dark:text-emerald-400",
    background: "bg-emerald-50 dark:bg-emerald-950/40",
  },
];

export default function LandingPage() {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isWishDialogOpen, setIsWishDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleTransactionDemo = async (_transaction: Transaction) => {
    setFeedback("Transação de demonstração salva com sucesso.");
  };

  const handleWishDemo = async (_wish: NewWish) => {
    setFeedback("Meta de demonstração criada com sucesso.");
  };

  return (
    <div className="w-full overflow-hidden bg-white text-[#1F2937] dark:bg-gray-700 dark:text-white">
      <section className="relative isolate overflow-hidden border-b border-slate-100 bg-gradient-to-b from-blue-50 via-white to-white dark:border-slate-700 dark:from-slate-800 dark:via-gray-700 dark:to-gray-700">
        <div className="absolute -top-24 right-[-8rem] -z-10 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-700/20" />
        <div className="absolute -bottom-24 left-[-7rem] -z-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-700/20" />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <Badge className="mb-5 w-fit border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
              Seu dinheiro, com mais clareza
            </Badge>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Planeje hoje. <span className="text-[#3B82F6]">Viva melhor</span> amanhã.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6B7280] dark:text-gray-300">
              MyFinances reúne seus gastos, metas e contas recorrentes em um só lugar para você tomar decisões financeiras com segurança.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[#3B82F6] text-white hover:bg-blue-700">
                <Link href="/register">
                  Começar agora <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/80 dark:bg-gray-800">
                <Link href="#recursos">Conhecer recursos</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#6B7280] dark:text-gray-300">
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#10B981]" /> Dados centralizados</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#10B981]" /> Visão mensal</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#10B981]" /> Metas acompanháveis</span>
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 bg-white/95 py-0 shadow-xl dark:border-slate-600 dark:bg-gray-800/95">
            <CardHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base text-[#1F2937] dark:text-white">Visão do seu mês</CardTitle>
                  <CardDescription>Exemplo de dashboard com dados simulados</CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-400" />
                  <span className="size-2 rounded-full bg-amber-400" />
                  <span className="size-2 rounded-full bg-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <MiniMetric label="Saldo" value="R$ 2.900" icon={WalletCards} color="text-emerald-500" />
                <MiniMetric label="Receitas" value="R$ 5.800" icon={Landmark} color="text-blue-500" />
                <MiniMetric label="Economia" value="50%" icon={PiggyBank} color="text-purple-500" />
              </div>
              <div className="mt-5 rounded-lg border border-slate-100 p-4 dark:border-slate-700">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">Progresso da meta</span>
                  <span className="text-sm font-semibold text-[#3B82F6]">68%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600"
                  role="progressbar"
                  aria-label="Progresso da meta Notebook novo"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={68}
                >
                  <div className="h-full w-[68%] rounded-full bg-[#3B82F6]" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280] dark:text-gray-400">
                  <span>Notebook novo</span>
                  <span>{formatCurrency(3400)} de {formatCurrency(5000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="recursos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="border-[#10B981] text-[#059669] dark:text-emerald-400">Feito para o dia a dia</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Tudo o que você precisa para cuidar das suas finanças</h2>
          <p className="mt-4 text-[#6B7280] dark:text-gray-300">Do registro diário à análise dos seus hábitos financeiros, sem complicação.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, description, icon: Icon, color, background }) => (
            <Card key={title} className="border-slate-200 bg-white transition-transform hover:-translate-y-1 dark:border-slate-600 dark:bg-gray-800">
              <CardHeader>
                <div className={`mb-2 flex size-11 items-center justify-center rounded-lg ${background}`}><Icon className={`size-5 ${color}`} /></div>
                <CardTitle className="text-lg text-[#1F2937] dark:text-white">{title}</CardTitle>
                <CardDescription className="leading-6">{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-16 dark:border-slate-600 dark:bg-gray-800/50 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-300">Acompanhe a evolução</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Uma visão clara do seu dinheiro</h2>
              <p className="mt-2 text-[#6B7280] dark:text-gray-300">Cards e gráficos ajudam a entender o que entra, o que sai e o que fica.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#3B82F6]"><BarChart3 className="size-4" /> Dados de demonstração</div>
          </div>
          <SummaryCards
            balance={2900}
            totalIncomes={5800}
            totalExpenses={2900}
            economyRate={50}
            highestSpendingCategory={{ category: "HOUSING", total: 1600 }}
            periodStart="2026-06-01"
            isLoading={false}
          />
          <MonthlyComparisonChart data={monthlyData} period={{ start: "2026-01-01", end: "2026-06-30" }} isLoading={false} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <Badge className="w-fit border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">Experimente a interface</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">Registros simples, escolhas mais conscientes</h2>
          <p className="mt-4 text-[#6B7280] dark:text-gray-300">Crie uma transação ou uma meta de exemplo e conheça os formulários e modais usados na aplicação.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button onClick={() => setIsTransactionDialogOpen(true)} className="bg-[#3B82F6] text-white hover:bg-blue-700"><CircleDollarSign /> Nova transação</Button>
            <Button onClick={() => setIsWishDialogOpen(true)} variant="outline"><Goal /> Criar uma meta</Button>
          </div>
          {feedback ? <p className="mt-4 text-sm font-medium text-[#059669] dark:text-emerald-400">{feedback}</p> : null}
        </div>

        <Card className="border-slate-200 bg-white dark:border-slate-600 dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between gap-3"><CardTitle className="text-xl text-[#1F2937] dark:text-white">Próximos passos</CardTitle><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">Em dia</Badge></div>
            <CardDescription>Organize seu mês em poucos minutos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChecklistItem text="Adicione seus ganhos e despesas" completed />
            <ChecklistItem text="Cadastre uma meta para o próximo objetivo" completed />
            <ChecklistItem text="Configure despesas recorrentes" />
            <ChecklistItem text="Compare seus resultados mês a mês" />
          </CardContent>
        </Card>
      </section>

      <section className="border-t border-slate-100 bg-[#1F2937] px-4 py-14 text-white dark:border-slate-600 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-bold">MyFinances</p>
            <p className="mt-2 text-sm text-gray-300">Organização financeira para escolhas mais tranquilas.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-slate-500 bg-transparent text-white hover:bg-white hover:text-[#1F2937]"><a href="https://github.com/Lucalopezz" target="_blank" rel="noreferrer"><Github /> GitHub</a></Button>
            <Button asChild variant="outline" className="border-slate-500 bg-transparent text-white hover:bg-white hover:text-[#1F2937]"><a href="https://www.linkedin.com/in/lucas-dalossa-a24381356/" target="_blank" rel="noreferrer"><Linkedin /> LinkedIn</a></Button>
          </div>
        </div>
      </section>

      <TransactionDialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        loading={false}
        onSubmit={handleTransactionDemo}
        showTrigger={false}
      />
      <WishDialog open={isWishDialogOpen} onOpenChange={setIsWishDialogOpen} onSubmit={handleWishDemo} loading={false} />
    </div>
  );
}

function MiniMetric({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof WalletCards; color: string }) {
  return <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/70"><Icon className={`size-4 ${color}`} /><p className="mt-2 text-xs text-[#6B7280] dark:text-gray-400">{label}</p><p className="mt-0.5 text-sm font-bold">{value}</p></div>;
}

function ChecklistItem({ text, completed = false }: { text: string; completed?: boolean }) {
  return <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700"><CheckCircle2 className={`size-5 shrink-0 ${completed ? "text-[#10B981]" : "text-slate-300 dark:text-slate-600"}`} /><span className="text-sm text-[#4B5563] dark:text-gray-200">{text}</span></div>;
}
