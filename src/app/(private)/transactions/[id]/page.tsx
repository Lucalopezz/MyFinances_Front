import Link from "next/link";
import { notFound } from "next/navigation";
import { getTransaction } from "@/actions/transaction/transactions";
import { formatCurrency, formatShortDate } from "@/utils/formatters";

export const dynamic = "force-dynamic";

export default async function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await getTransaction(id);
  if (!transaction) notFound();
  return <main className="mx-auto max-w-xl p-6">
    <Link href="/transactions" className="text-sm underline">Voltar às transações</Link>
    <h1 className="mt-4 text-2xl font-bold">Transação</h1>
    <dl className="mt-4 grid gap-3 rounded-lg border p-5">
      <div><dt className="text-sm text-muted-foreground">Descrição</dt><dd>{transaction.description || "Sem descrição"}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Valor</dt><dd className="font-semibold">{formatCurrency(transaction.value)}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Data</dt><dd>{formatShortDate(transaction.date)}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Tipo</dt><dd>{transaction.type === "EXPENSE" ? "Despesa" : "Receita"}</dd></div>
      <div><dt className="text-sm text-muted-foreground">Categoria</dt><dd>{transaction.category}</dd></div>
    </dl>
  </main>;
}
