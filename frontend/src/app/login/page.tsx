'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/Logo';
import BankingBackground from '@/components/BankingBackground';
import { Shield, Lock, TrendingUp } from 'lucide-react';

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
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:block space-y-8 animate-fade-in-left">
            <div className="space-y-4">
              <Logo size="xl" />
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Secure Access to Your
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Financial Portfolio
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Experience seamless digital banking with enterprise-grade security and instant transactions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100 transform hover:scale-105 transition-transform duration-300">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bank-Grade Security</h3>
                  <p className="text-sm text-gray-600">256-bit encryption protecting your assets</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-100 transform hover:scale-105 transition-transform duration-300">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-Time Transactions</h3>
                  <p className="text-sm text-gray-600">Instant transfers and currency exchange</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100 transform hover:scale-105 transition-transform duration-300">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Compliance Certified</h3>
                  <p className="text-sm text-gray-600">Fully regulated financial institution</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full animate-fade-in-right">
            <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10 border border-white/20">
              <div className="md:hidden mb-6">
                <Logo size="lg" className="justify-center" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Access Your Account
                </h2>
                <p className="text-gray-600">
                  Enter your credentials to securely access your banking portal
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
                      Open an Account
                    </Link>
                  </p>
                </div>
              </form>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-xs text-center text-blue-900 font-semibold mb-3">
                  🔐 Demo Account - Test Our Platform
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-blue-800">
                    <span className="font-medium">Email:</span>
                    <p className="break-all">o.olaniran@minibank.com</p>
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">PIN:</span>
                    <p>password123</p>
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">USD Vault:</span>
                    <p>$25,000</p>
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">EUR Vault:</span>
                    <p>€25,000</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              Protected by 256-bit SSL encryption • © 2024 MiniBank • All rights reserved
            </p>
          </div>
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
