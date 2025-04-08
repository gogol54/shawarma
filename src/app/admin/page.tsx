'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { axiosInstance } from '@/lib/utils';

const AdminLogin = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async (): Promise<void> => {
    try {
      await axiosInstance.post('/api/admin', { email, password });
      toast.success('Link enviado com sucesso! Verifique seu email.');
    } catch (error) {
      console.log(error)
      toast.error('Credenciais inválidas ou erro no envio do link.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>
      <input
        type="email"
        className="border px-4 py-2 rounded w-full max-w-sm"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border px-4 py-2 rounded w-full max-w-sm"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
      >
        Enviar Link de Acesso
      </button>
    </div>
  );
}

export default AdminLogin