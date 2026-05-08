import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TelegramLogin from '../components/TelegramLogin';
import BotLogin from '../components/BotLogin';
import { useAuthStore } from '../store/authStore';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Access denied. Contact admin to register your account.',
  invalid: 'Login failed — invalid Telegram signature. Please try again.',
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const errorParam = searchParams.get('error');
  const displayError = useMemo(
    () => (errorParam ? ERROR_MESSAGES[errorParam] || 'Login failed. Please try again.' : ''),
    [errorParam],
  );

  useEffect(() => { document.title = `${APP_NAME} — Login`; }, []);

  useEffect(() => {
    if (user) navigate('/overview', { replace: true });
  }, [user, navigate]);

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
        <TelegramLogin />

        {displayError && (
          <p className="mt-4 text-sm text-red bg-red/10 border border-red/20 rounded-lg px-3 py-2">
            {displayError}
          </p>
        )}

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-muted text-xs uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <BotLogin />
      </div>

      <p className="mt-8 text-text-muted text-xs">Secure login via Telegram</p>
    </div>
  );
}
