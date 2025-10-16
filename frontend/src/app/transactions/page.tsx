'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { transactionsApi, Transaction } from '@/lib/api';
import { formatCurrency, formatDate, getTransactionSign, getTransactionColor } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Filter } from 'lucide-react';

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, filter, page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (filter) {
        params.type = filter;
      }
      const data = await transactionsApi.getTransactions(params);
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (authLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600">View all your transactions</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <Select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Transactions' },
                  { value: 'TRANSFER', label: 'Transfers Only' },
                  { value: 'EXCHANGE', label: 'Exchanges Only' },
                ]}
              />
              {filter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilter('');
                    setPage(1);
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter ? `${filter.charAt(0) + filter.slice(1).toLowerCase()}s` : 'All Transactions'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({total} total)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No transactions found
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center flex-1">
                        <div
                          className={`p-3 rounded-full ${
                            tx.isDebit ? 'bg-red-100' : 'bg-green-100'
                          } mr-4`}
                        >
                          {tx.type === 'EXCHANGE' ? (
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                          ) : tx.isDebit ? (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {tx.type === 'TRANSFER' ? 'Transfer' : 'Currency Exchange'}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                tx.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {tx.description || 'No description'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p
                          className={`text-lg font-bold ${getTransactionColor(
                            tx.isDebit
                          )}`}
                        >
                          {getTransactionSign(tx.isDebit)}
                          {formatCurrency(tx.amount, tx.currency)}
                        </p>
                        {tx.type === 'EXCHANGE' && tx.convertedAmount && (
                          <>
                            <p className="text-sm text-gray-600 mt-1">
                              {tx.isDebit ? '→' : '←'} {formatCurrency(
                                tx.convertedAmount,
                                tx.toAccount.currency
                              )}
                            </p>
                            {tx.exchangeRate && (
                              <p className="text-xs text-gray-500">
                                Rate: {tx.exchangeRate.toFixed(4)}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
