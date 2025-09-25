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
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 py-8 relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-32 right-20 w-40 h-40 bg-gradient-to-r from-yellow-200 to-amber-200 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-20 left-32 w-36 h-36 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl shadow-lg mb-2">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-amber-800 mb-1">Manage Toko</h1>
          <p className="text-amber-600 text-xs">Sistem Manajemen Toko Modern</p>
        </div>

        {/* Compact Login Form */}
        <div className="bg-white border border-amber-200 rounded-2xl shadow-xl p-5">
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold text-amber-800 mb-1">Selamat Datang</h2>
            <p className="text-amber-600 text-xs">Silakan masuk untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Username Field */}
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-medium text-amber-800">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-amber-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 bg-amber-50/50 text-amber-900 placeholder-amber-400 text-sm"
                  placeholder="Masukkan username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-medium text-amber-800">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-amber-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-9 pr-10 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 bg-amber-50/50 text-amber-900 placeholder-amber-400 text-sm"
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
                    <EyeOff className="h-4 w-4 text-amber-500 hover:text-amber-700 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-amber-500 hover:text-amber-700 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                {error}
              </div>
            )}

            {/* Login Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-amber-300 disabled:to-orange-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg text-sm"
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

          {/* Compact Demo Credentials */}
          <div className="mt-3 pt-3 border-t border-amber-100">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <h3 className="text-xs font-semibold text-amber-700 mb-1">Demo Login:</h3>
              <div className="text-xs text-amber-600 leading-tight space-y-0.5">
                <p><strong className="text-amber-800">Username:</strong> admin</p>
                <p><strong className="text-amber-800">Password:</strong> admin12345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="text-center mt-2 text-amber-600 text-xs">
          <p>&copy; 2025 Manage Toko. Sistem manajemen toko modern.</p>
        </div>
      </div>
    </div>
  );
}