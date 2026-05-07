import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from .config import DATABASE_URL

logger = logging.getLogger(__name__)

engine = None
async_session = None

if DATABASE_URL:
    _db_url = DATABASE_URL.replace('postgres://', 'postgresql://', 1) if DATABASE_URL.startswith('postgres://') else DATABASE_URL
    async_url = _db_url.replace('postgresql://', 'postgresql+asyncpg://', 1)
    engine = create_async_engine(async_url, echo=False, pool_size=20, max_overflow=10)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
else:
    logger.warning('DATABASE_URL is empty – database features disabled')

async def get_db() -> AsyncSession:
    if async_session is None:
        raise RuntimeError('Database not configured (DATABASE_URL is empty)')
    async with async_session() as session:
        yield session
