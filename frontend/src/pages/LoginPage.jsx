import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import Button from '../components/Button';
import Card from '../components/Card';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login({ username, password });
    if (!success) {
      setError('Login yoki parol xato!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-primary-100 rounded-full blur-[100px] opacity-60" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-emerald-100 rounded-full blur-[100px] opacity-60" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl text-white font-bold text-2xl shadow-xl shadow-primary-200 mb-4">E</div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900">EduPuls</h1>
          <p className="text-slate-500 mt-2">Platformaga xush kelibsiz</p>
        </div>

        <Card className="p-8 border-none shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Foydalanuvchi nomi</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                  placeholder="Login"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Parol</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full h-14 font-bold text-lg gap-2 shadow-xl shadow-primary-100">
              Kirish <LogIn size={20} />
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-sm italic">"Har bir dars nazoratda. Har bir ustoz statistikada."</p>
          </div>
        </Card>
        
        {/* Test Accounts Hint */}
        <div className="mt-8 text-center p-4 bg-white/50 backdrop-blur rounded-2xl border border-white/50 text-xs text-slate-500 space-x-4">
          <span><b>Admin:</b> admin / 123</span>
          <span><b>Teacher:</b> teacher / 123</span>
          <span><b>Super:</b> super / 123</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
