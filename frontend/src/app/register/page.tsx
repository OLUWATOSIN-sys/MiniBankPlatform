'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/Logo';
import BankingBackground from '@/components/BankingBackground';
import { Sparkles, Wallet, Globe, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message || 'Account opening failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <BankingBackground />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <div className="hidden md:block space-y-8 animate-fade-in-left">
            <div className="space-y-4">
              <Logo size="xl" />
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Open Your
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Premium Account
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Join thousands of clients managing their wealth with our award-winning digital banking platform.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Instant Account Activation</h3>
                  <p className="text-sm text-gray-600 mt-1">Get $1,000 USD and €500 EUR credited instantly to start your financial journey</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Multi-Currency Vaults</h3>
                  <p className="text-sm text-gray-600 mt-1">Seamlessly manage USD and EUR accounts with zero maintenance fees</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-purple-100 shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Global Transfers</h3>
                  <p className="text-sm text-gray-600 mt-1">Send money worldwide instantly with competitive exchange rates</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl text-white">
              <p className="text-sm font-semibold mb-2">🎁 LIMITED TIME OFFER</p>
              <p className="text-2xl font-bold mb-1">Welcome Bonus</p>
              <p className="text-blue-100">Open your account today and receive instant credit to begin trading</p>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full animate-fade-in-right">
            <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10 border border-white/20">
              <div className="md:hidden mb-6">
                <Logo size="lg" className="justify-center" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Launch Your Financial Journey
                </h2>
                <p className="text-gray-600">
                  Complete the form below to activate your premium banking account
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                    className="bg-white/50"
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                    className="bg-white/50"
                  />
                </div>
                
                <Input
                  label="Account Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  className="bg-white/50"
                />
                
                <Input
                  label="Security PIN"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                  className="bg-white/50"
                />

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-shake">
                    <p className="text-sm text-red-800 font-medium">⚠️ {error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg" 
                    loading={loading}
                  >
                    {loading ? 'Activating Account...' : (
                      <span className="flex items-center justify-center gap-2">
                        Open My Account
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <p className="text-xs text-center text-green-900 font-semibold mb-2">
                      ✨ Your Welcome Package
                    </p>
                    <div className="flex justify-center gap-6 text-sm font-bold text-green-800">
                      <div>
                        <span className="block text-2xl">$1,000</span>
                        <span className="text-xs font-normal">USD Vault</span>
                      </div>
                      <div className="text-green-600">+</div>
                      <div>
                        <span className="block text-2xl">€500</span>
                        <span className="text-xs font-normal">EUR Vault</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      href="/login" 
                      className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              By opening an account, you agree to our Terms of Service and Privacy Policy
            </p>
            <p className="text-center text-xs text-gray-500">
              Protected by 256-bit SSL encryption • FDIC Insured • © 2024 MiniBank
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
