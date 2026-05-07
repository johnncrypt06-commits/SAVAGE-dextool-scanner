import json
import redis.asyncio as redis


class RedisPool:
    def __init__(self):
        self.client: redis.Redis | None = None

    async def connect(self, url: str):
        self.client = redis.from_url(url, decode_responses=True)
        await self.client.ping()

    async def close(self):
        if self.client:
            await self.client.aclose()
            self.client = None

    async def cache_price(self, token_address: str, price_data: dict):
        if self.client:
            await self.client.setex(f'price:{token_address}', 30, json.dumps(price_data))

    async def get_cached_price(self, token_address: str) -> dict | None:
        if not self.client:
            return None
        raw = await self.client.get(f'price:{token_address}')
        return json.loads(raw) if raw else None

    async def publish(self, channel: str, message: dict):
        if self.client:
            await self.client.publish(channel, json.dumps(message))

    async def pubsub(self):
        if not self.client:
            return None
        return self.client.pubsub()


redis_pool = RedisPool()
