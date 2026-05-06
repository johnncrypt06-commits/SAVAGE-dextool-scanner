import { useEffect, useRef } from 'react';

const BOT_NAME = import.meta.env.VITE_TELEGRAM_BOT_NAME || 'your_bot_name';

interface TelegramLoginProps {
  onAuth: (user: Record<string, unknown>) => void;
}

export default function TelegramLogin({ onAuth }: TelegramLoginProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).onTelegramAuth = (user: Record<string, unknown>) => {
      onAuth(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    containerRef.current?.appendChild(script);

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [onAuth]);

  return <div ref={containerRef} className="flex justify-center" />;
}
