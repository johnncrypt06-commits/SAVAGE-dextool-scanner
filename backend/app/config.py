import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://savage:savage@localhost:5432/savage_trading')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
JWT_SECRET = os.getenv('JWT_SECRET', 'change-me-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRE_HOURS = int(os.getenv('JWT_EXPIRE_HOURS', '72'))
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
ADMIN_TELEGRAM_IDS = [int(x.strip()) for x in os.getenv('ADMIN_TELEGRAM_IDS', os.getenv('TELEGRAM_CHAT_ID', '0')).split(',') if x.strip()]
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
RPC_URL_SOL = os.getenv('RPC_URL_SOL', 'https://api.mainnet-beta.solana.com')
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', '')
BIRDEYE_API_KEY = os.getenv('BIRDEYE_API_KEY', '')
BACKEND_PORT = int(os.getenv('BACKEND_PORT', '8000'))
