'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { accountsApi, transactionsApi, Account } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight, RefreshCw } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function TransferPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'transfer' | 'exchange'>('transfer');
  
  // Transfer state
  const [users, setUsers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transferForm, setTransferForm] = useState({
    toUserId: '',
    currency: 'USD',
    amount: '',
    description: '',
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Exchange state
  const [exchangeForm, setExchangeForm] = useState({
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: '',
  });
  const [exchangeRate] = useState(0.92);
  const [convertedAmount, setConvertedAmount] = useState('0.00');
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'exchange') {
      setActiveTab('exchange');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Calculate converted amount for exchange
    if (exchangeForm.amount) {
      const amount = parseFloat(exchangeForm.amount);
      if (!isNaN(amount)) {
        if (exchangeForm.fromCurrency === 'USD' && exchangeForm.toCurrency === 'EUR') {
          setConvertedAmount((amount * exchangeRate).toFixed(2));
        } else if (exchangeForm.fromCurrency === 'EUR' && exchangeForm.toCurrency === 'USD') {
          setConvertedAmount((amount / exchangeRate).toFixed(2));
        }
      }
    } else {
      setConvertedAmount('0.00');
    }
  }, [exchangeForm.amount, exchangeForm.fromCurrency, exchangeForm.toCurrency, exchangeRate]);

  const loadData = async () => {
    try {
      const [usersData, accountsData] = await Promise.all([
        accountsApi.getUsers(),
        accountsApi.getAccounts(),
      ]);
      setUsers(usersData);
      setAccounts(accountsData);
      
      if (usersData.length > 0) {
        setTransferForm(prev => ({ ...prev, toUserId: usersData[0].userId }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTransferSuccess(false);
    setTransferLoading(true);

    try {
      const amount = parseFloat(transferForm.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const account = accounts.find(acc => acc.currency === transferForm.currency);
      if (!account || account.balance < amount) {
        throw new Error('Insufficient funds');
      }

      await transactionsApi.transfer({
        toUserId: transferForm.toUserId,
        currency: transferForm.currency,
        amount,
        description: transferForm.description,
      });

      setTransferSuccess(true);
      setTransferForm(prev => ({ ...prev, amount: '', description: '' }));
      await loadData(); // Reload balances
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExchangeSuccess(false);
    setExchangeLoading(true);

    try {
      const amount = parseFloat(exchangeForm.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (exchangeForm.fromCurrency === exchangeForm.toCurrency) {
        throw new Error('Cannot exchange to the same currency');
      }

      const account = accounts.find(acc => acc.currency === exchangeForm.fromCurrency);
      if (!account || account.balance < amount) {
        throw new Error('Insufficient funds');
      }

      await transactionsApi.exchange({
        fromCurrency: exchangeForm.fromCurrency,
        toCurrency: exchangeForm.toCurrency,
        amount,
      });

      setExchangeSuccess(true);
      setExchangeForm(prev => ({ ...prev, amount: '' }));
      await loadData(); // Reload balances
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Exchange failed');
    } finally {
      setExchangeLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const usdAccount = accounts.find(acc => acc.currency === 'USD');
  const eurAccount = accounts.find(acc => acc.currency === 'EUR');

  return (
    <Layout>
      <div className="px-4 sm:px-0 max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transfer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transfer Money
            </button>
            <button
              onClick={() => setActiveTab('exchange')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exchange'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exchange Currency
            </button>
          </nav>
        </div>

        {/* Available Balances */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">USD Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {usdAccount ? formatCurrency(usdAccount.balance, 'USD') : '$0.00'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">EUR Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {eurAccount ? formatCurrency(eurAccount.balance, 'EUR') : '€0.00'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Form */}
        {activeTab === 'transfer' && (
          <Card>
            <CardHeader>
              <CardTitle>Transfer Money</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <Select
                  label="Recipient"
                  value={transferForm.toUserId}
                  onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
                  options={users.map(user => ({
                    value: user.userId,
                    label: `${user.firstName} ${user.lastName} (${user.email})`,
                  }))}
                  required
                />

                <Select
                  label="Currency"
                  value={transferForm.currency}
                  onChange={(e) => setTransferForm({ ...transferForm, currency: e.target.value })}
                  options={[
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' },
                  ]}
                  required
                />

                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />

                <Input
                  label="Description (Optional)"
                  type="text"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                  placeholder="Payment for services"
                />

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {transferSuccess && (
                  <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-800">
                      Transfer completed successfully! Redirecting...
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" loading={transferLoading}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Complete Transfer
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Exchange Form */}
        {activeTab === 'exchange' && (
          <Card>
            <CardHeader>
              <CardTitle>Exchange Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExchange} className="space-y-4">
                <Select
                  label="From Currency"
                  value={exchangeForm.fromCurrency}
                  onChange={(e) => {
                    const newFrom = e.target.value;
                    setExchangeForm({
                      ...exchangeForm,
                      fromCurrency: newFrom,
                      toCurrency: newFrom === 'USD' ? 'EUR' : 'USD',
                    });
                  }}
                  options={[
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' },
                  ]}
                  required
                />

                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={exchangeForm.amount}
                  onChange={(e) => setExchangeForm({ ...exchangeForm, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />

                <div className="flex items-center justify-center py-2">
                  <RefreshCw className="w-6 h-6 text-gray-400" />
                </div>

                <Select
                  label="To Currency"
                  value={exchangeForm.toCurrency}
                  onChange={(e) => setExchangeForm({ ...exchangeForm, toCurrency: e.target.value })}
                  options={[
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' },
                  ]}
                  required
                  disabled
                />

                {/* Exchange Rate Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Exchange Rate</span>
                    <span className="text-sm font-medium">
                      1 {exchangeForm.fromCurrency} = {exchangeForm.fromCurrency === 'USD' ? exchangeRate : (1 / exchangeRate).toFixed(4)} {exchangeForm.toCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">You will receive</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(parseFloat(convertedAmount), exchangeForm.toCurrency)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {exchangeSuccess && (
                  <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-800">
                      Exchange completed successfully! Redirecting...
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" loading={exchangeLoading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Complete Exchange
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default function TransferPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <TransferPageContent />
    </Suspense>
  );
}
