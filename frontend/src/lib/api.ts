import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Account {
  id: string;
  currency: string;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  convertedAmount?: number;
  description: string;
  isDebit: boolean;
  fromAccount: any;
  toAccount: any;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TransferData {
  toUserId: string;
  currency: string;
  amount: number;
  description?: string;
}

export interface ExchangeData {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

// Auth API
export const authApi = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Accounts API
export const accountsApi = {
  getAccounts: async (): Promise<Account[]> => {
    const response = await api.get('/accounts');
    return response.data;
  },
  getBalance: async (accountId: string) => {
    const response = await api.get(`/accounts/${accountId}/balance`);
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/accounts/users');
    return response.data;
  },
};

// Transactions API
export const transactionsApi = {
  transfer: async (data: TransferData) => {
    const response = await api.post('/transactions/transfer', data);
    return response.data;
  },
  exchange: async (data: ExchangeData) => {
    const response = await api.post('/transactions/exchange', data);
    return response.data;
  },
  getTransactions: async (params?: {
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },
  getRecentTransactions: async () => {
    const response = await api.get('/transactions/recent');
    return response.data;
  },
};

export default api;
