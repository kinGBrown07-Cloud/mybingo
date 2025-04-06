"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface Transaction {
  id: string;
  profileId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND';
  amount: number;
  pointsAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  profile: {
    username: string;
  };
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/transactions');
      const data = await response.json();

      if (response.ok) {
        setTransactions(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les transactions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (session?.user) {
      fetchTransactions();
    }
  }, [session, fetchTransactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'bg-blue-100 text-blue-800';
      case 'WITHDRAWAL':
        return 'bg-orange-100 text-orange-800';
      case 'BET':
        return 'bg-purple-100 text-purple-800';
      case 'WIN':
        return 'bg-green-100 text-green-800';
      case 'REFUND':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Transactions</h1>
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder="Rechercher une transaction..."
            className="w-[300px]"
          />
          <Button>Exporter</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.profile.username}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.amount} XOF</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
