from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..auth import decode_jwt
from ..ws_manager import ws_manager

router = APIRouter()


@router.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get('token') or websocket.cookies.get('auth_token')
    payload = decode_jwt(token or '')
    if not payload:
        await websocket.close(code=1008)
        return
    user_id = int(payload['sub'])
    await ws_manager.connect(websocket, user_id)
    await websocket.send_json({'type': 'connected', 'data': {'user_id': user_id}})
    try:
        while True:
            msg = await websocket.receive_text()
            if msg.lower() == 'ping':
                await websocket.send_json({'type': 'pong', 'data': {}})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
