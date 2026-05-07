import asyncio
import json
import logging
from collections import defaultdict
from fastapi import WebSocket
from .redis_client import redis_pool

logger = logging.getLogger(__name__)
EVENT_TYPES = {'price_update', 'position_update', 'trade_closed', 'kill_switch_triggered', 'new_token_detected'}


class WebSocketManager:
    def __init__(self):
        self.connections: dict[int, set[WebSocket]] = defaultdict(set)
        self._task: asyncio.Task | None = None

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        self.connections[user_id].discard(websocket)
        if not self.connections[user_id]:
            self.connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, event_type: str, data: dict):
        payload = {'type': event_type, 'data': data}
        dead = []
        for ws in self.connections.get(user_id, set()).copy():
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, user_id)

    async def broadcast_to_all(self, event_type: str, data: dict):
        for user_id in list(self.connections):
            await self.send_to_user(user_id, event_type, data)

    async def start_redis_listener(self):
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._redis_loop())

    async def stop_redis_listener(self):
        if self._task:
            self._task.cancel()
            self._task = None

    async def _redis_loop(self):
        pubsub = await redis_pool.pubsub()
        if pubsub is None:
            return
        await pubsub.subscribe('trading_events')
        try:
            async for message in pubsub.listen():
                if message.get('type') != 'message':
                    continue
                try:
                    payload = json.loads(message.get('data') or '{}')
                    event_type = payload.get('type', 'position_update')
                    data = payload.get('data', payload)
                    user_id = payload.get('user_id') or data.get('user_id')
                    if user_id is not None:
                        await self.send_to_user(int(user_id), event_type, data)
                    else:
                        await self.broadcast_to_all(event_type, data)
                except Exception as exc:
                    logger.exception('WebSocket Redis dispatch failed: %s', exc)
        finally:
            await pubsub.aclose()


ws_manager = WebSocketManager()
