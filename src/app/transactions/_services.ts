import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Transaction } from "@/components/dashboard/TransactionDialog";

export async function getTransactions(): Promise<Transaction[]> {
    const session = await getServerSession(authOptions);
    
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/transactions`, {
        headers: {
          'Authorization': `Bearer ${session?.jwt}`,
          'Content-Type': 'application/json'
        },
        next: { tags: ['transactions'] }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Não autorizado - sessão expirada');
        }
        throw new Error('Falha ao buscar transações');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro:', error);
      return [];
    }
  }