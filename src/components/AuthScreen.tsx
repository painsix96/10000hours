import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  LogIn, 
  Mail, 
  Lock, 
  UserPlus, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  signIn, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  auth 
} from '../firebase';

export function AuthScreen() {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = `认证失败: ${err.message || '请检查你的输入'}`;
      if (err.code === 'auth/user-not-found') message = '用户不存在。';
      if (err.code === 'auth/wrong-password') message = '密码错误。';
      if (err.code === 'auth/email-already-in-use') message = '该邮箱已被注册。';
      if (err.code === 'auth/weak-password') message = '密码太弱（至少6位）。';
      if (err.code === 'auth/invalid-email') message = '邮箱格式不正确。';
      if (err.code === 'auth/operation-not-allowed') message = '邮箱登录未启用，请联系管理员。';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn();
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      // If blocked by VPN, show a helpful message
      if (err.code === 'auth/network-request-failed') {
        setError('无法连接到 Google 服务。如果你在中国大陆，请尝试使用邮箱登录。');
      } else {
        setError('Google 登录失败。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <AnimatePresence mode="wait">
        {mode === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xs flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mb-8">
              <Award size={48} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">一万小时</h1>
            <p className="text-gray-500 mb-12 font-medium">
              追踪你的 10,000 小时人生目标，见证从平凡到卓越的蜕变。
            </p>

            <div className="w-full space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                使用 Google 登录
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-bold">或者</span>
                </div>
              </div>

              <button
                onClick={() => setMode('login')}
                className="w-full bg-gray-50 text-gray-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
              >
                <Mail size={20} />
                使用邮箱登录
              </button>
              
              <button
                onClick={() => setMode('signup')}
                className="w-full text-blue-600 py-2 font-bold text-sm hover:underline"
              >
                没有账号？立即注册
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-xs"
          >
            <button
              onClick={() => setMode('landing')}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-8 font-bold text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              返回
            </button>

            <h2 className="text-3xl font-black text-gray-900 mb-2 text-left tracking-tight">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h2>
            <p className="text-gray-500 mb-8 text-left font-medium">
              {mode === 'login' ? '登录以同步你的精进记录。' : '开始你的 10,000 小时旅程。'}
            </p>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : mode === 'login' ? (
                  <LogIn size={20} />
                ) : (
                  <UserPlus size={20} />
                )}
                {mode === 'login' ? '登录' : '注册'}
              </button>
            </form>

            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="mt-6 text-gray-400 font-bold text-sm hover:text-blue-600 transition-colors"
            >
              {mode === 'login' ? '没有账号？立即注册' : '已有账号？去登录'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 text-[10px] text-gray-300 font-bold tracking-widest uppercase">
        v1.3
      </div>
    </div>
  );
}
