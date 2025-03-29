import { Transaction } from "../dashboard/TransactionDialog";


interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <TransactionRow 
                key={transaction.id || `${transaction.date}-${transaction.description}-${transaction.value}`}
                transaction={transaction} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(transaction.date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {transaction.description}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {transaction.category}
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
        transaction.type === 'INCOME' 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
      }`}>
        {transaction.type === 'INCOME' ? '+' : '-'} R$ {transaction.value.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          transaction.type === 'INCOME' 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
        }`}>
          {transaction.type === 'INCOME' ? 'Entrada' : 'Saída'}
        </span>
      </td>
    </tr>
  );
}