from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import FRONTEND_URL, REDIS_URL
from .redis_client import redis_pool
from .ws_manager import ws_manager
from .routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await redis_pool.connect(REDIS_URL)
    if redis_pool.client:
        await ws_manager.start_redis_listener()
    yield
    await ws_manager.stop_redis_listener()
    await redis_pool.close()


app = FastAPI(title='SAVAGE Trading Dashboard', lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
app.include_router(router, prefix='/api')


@app.get('/api/health')
async def health():
    return {'status': 'ok'}


@app.get('/')
async def root():
    return {'status': 'ok', 'docs': '/docs', 'health': '/api/health'}
