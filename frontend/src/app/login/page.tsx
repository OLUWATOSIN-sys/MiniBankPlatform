'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/Logo';
import BankingBackground from '@/components/BankingBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BankingBackground />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full animate-fade-in-right">
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10 border border-white/20">
            <div className="mb-8 flex justify-center">
              <Logo size="lg" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600">
                Access your account
              </p>
            </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Account Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="bg-white/50"
                />
                
                <Input
                  label="Security PIN"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your secure PIN"
                  className="bg-white/50"
                />

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-shake">
                    <p className="text-sm text-red-800 font-medium">⚠️ {error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg" 
                  loading={loading}
                >
                  {loading ? 'Authenticating...' : 'Access Account'}
                </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                New to MiniBank?{' '}
                <Link 
                  href="/register" 
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <p className="text-xs text-center text-blue-900 font-semibold mb-3">
              Test Demo Accounts (or create your own above)
            </p>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="flex justify-between items-center">
                <span className="font-medium">alice.johnson@minibank.com</span>
                <span className="text-blue-600">password123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">bob.smith@minibank.com</span>
                <span className="text-blue-600">password123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">charlie.brown@minibank.com</span>
                <span className="text-blue-600">password123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">o.olaniran@minibank.com</span>
                <span className="text-blue-600">password123</span>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200 text-center text-blue-700">
                All accounts: $25,000 USD + €25,000 EUR
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2025 MiniBank
        </p>
      </div>
    </div>

      <style jsx>{`
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
}
