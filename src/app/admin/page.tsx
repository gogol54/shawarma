'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { axiosInstance } from '@/lib/utils';

const AdminLogin = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // 👈 estado de loading

  const handleLogin = async (): Promise<void> => {
    setLoading(true); // 👈 ativa loading
    try {
      await axiosInstance.post('/api/admin', { email, password });
      toast.success('Link enviado com sucesso! Verifique seu email.');
    } catch (error) {
      console.log(error);
      toast.error('Credenciais inválidas ou erro no envio do link.');
    } finally {
      setLoading(false); // 👈 desativa loading
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
        disabled={loading} // 👈 desativa o botão durante o loading
        className={`bg-blue-600 text-white rounded px-4 py-2 transition w-full max-w-sm ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        {loading ? 'Enviando...' : 'Enviar Link de Acesso'}
      </button>
    </div>
  );
};

export default AdminLogin;
