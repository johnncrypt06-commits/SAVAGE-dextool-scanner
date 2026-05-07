import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TelegramLogin from '../components/TelegramLogin';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { TelegramLoginData } from '../api/types';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';
import Spinner from '../components/ui/Spinner';

export default function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = `${APP_NAME} — Login`; }, []);

  useEffect(() => {
    if (user) navigate('/overview', { replace: true });
  }, [user, navigate]);

  const handleAuth = useCallback(async (data: Record<string, unknown>) => {
    setError('');
    setLoading(true);
    try {
      const userInfo = await api.loginTelegram(data as unknown as TelegramLoginData);
      setUser(userInfo);
      navigate('/overview', { replace: true });
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('not registered') || msg.includes('403') || msg.includes('Forbidden')) {
        setError('Access denied. Contact admin to register your account.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <div className="relative mb-12 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-widest text-green drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">
          {APP_NAME}
        </h1>
        <p className="mt-3 text-text-secondary text-sm tracking-wide">{APP_TAGLINE}</p>
        <div className="absolute -inset-8 bg-green/5 blur-3xl rounded-full -z-10" />
      </div>

      <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-xl p-8 w-full max-w-sm text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Spinner size={28} />
            <span className="text-text-secondary text-sm">Authenticating...</span>
          </div>
        ) : (
          <TelegramLogin onAuth={handleAuth} />
        )}

        {error && (
          <p className="mt-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      <p className="mt-8 text-text-muted text-xs">Secure login via Telegram</p>
    </div>
  );
}
