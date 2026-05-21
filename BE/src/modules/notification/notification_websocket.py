from fastapi import WebSocket, WebSocketDisconnect
from src.modules.notification.notification_manager import notification_manager


async def notification_ws(websocket: WebSocket, user_id: int):
    await notification_manager.connect(user_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        notification_manager.disconnect(user_id, websocket)
