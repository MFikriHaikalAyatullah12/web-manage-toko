'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Eye, EyeOff, ShoppingCart, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = login(formData.username, formData.password);
    if (!success) {
      setError('Username atau password salah!');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 py-6 relative">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-20 left-32 w-28 h-28 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Compact Professional Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg mb-3">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Manage Toko</h1>
          <p className="text-blue-200 text-xs">Sistem Manajemen Toko Profesional</p>
        </div>

        {/* Compact Professional Login Card */}
        <div className="bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-xl p-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Selamat Datang</h2>
            <p className="text-slate-600 text-xs">Silakan masuk untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Compact Username Field */}
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-semibold text-slate-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium"
                  placeholder="Masukkan username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Compact Password Field */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-blue-500 hover:text-blue-700 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-blue-500 hover:text-blue-700 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            {/* Compact Professional Login Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:scale-100 disabled:cursor-not-allowed shadow-lg text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  'Masuk'
                )}
              </button>
            </div>
          </form>

          {/* Compact Professional Demo Credentials */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 className="text-xs font-bold text-blue-800 mb-1">Demo Login:</h3>
              <div className="text-xs text-blue-700 font-medium space-y-0.5">
                <p><strong className="text-blue-900">Username:</strong> admin</p>
                <p><strong className="text-blue-900">Password:</strong> admin12345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="text-center mt-3 text-blue-200 text-xs">
          <p>&copy; 2025 Manage Toko. Sistem manajemen toko profesional.</p>
        </div>
      </div>
    </div>
  );
}