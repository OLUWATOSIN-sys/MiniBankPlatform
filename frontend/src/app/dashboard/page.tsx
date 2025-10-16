'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { accountsApi, transactionsApi, Account, Transaction } from '@/lib/api';
import { formatCurrency, formatDate, getTransactionSign, getTransactionColor } from '@/lib/utils';
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [accountsData, transactionsData] = await Promise.all([
        accountsApi.getAccounts(),
        transactionsApi.getRecentTransactions(),
      ]);
      setAccounts(accountsData);
      setRecentTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Account Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {account.currency} Account
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Wallet className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => router.push('/transfer')}
            className="h-16 text-lg"
          >
            <ArrowUpRight className="w-5 h-5 mr-2" />
            Transfer Money
          </Button>
          <Button
            onClick={() => router.push('/transfer?tab=exchange')}
            variant="secondary"
            className="h-16 text-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Exchange Currency
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/transactions')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${tx.isDebit ? 'bg-red-100' : 'bg-green-100'} mr-3`}>
                        {tx.isDebit ? (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {tx.type === 'TRANSFER' ? 'Transfer' : 'Exchange'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(tx.isDebit)}`}>
                        {getTransactionSign(tx.isDebit)}
                        {formatCurrency(tx.amount, tx.currency)}
                      </p>
                      {tx.convertedAmount && (
                        <p className="text-sm text-gray-500">
                          ≈ {formatCurrency(tx.convertedAmount, tx.toAccount.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
