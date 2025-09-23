'use client';

import { useState } from 'react';
import Link from 'next/link';
import { setupDatabase } from '@/lib/setup';

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const result = await fetch('/api/setup', {
        method: 'POST',
      });
      
      const data = await result.json();
      
      if (data.success) {
        setMessage('Database berhasil di-setup! Anda dapat mulai menggunakan aplikasi.');
        setIsSuccess(true);
      } else {
        setMessage(`Error: ${data.error}`);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Setup Database
          </h1>
          <p className="text-gray-900 mb-6">
            Klik tombol di bawah untuk membuat tabel dan data awal di database PostgreSQL Neon.
          </p>
          
          <button
            onClick={handleSetup}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Setting up...' : 'Setup Database'}
          </button>
          
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              isSuccess 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          {isSuccess && (
            <div className="mt-4">
              <Link
                href="/"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Ke Dashboard
              </Link>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-900">
            <p>Database: PostgreSQL Neon</p>
            <p>Status: Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}