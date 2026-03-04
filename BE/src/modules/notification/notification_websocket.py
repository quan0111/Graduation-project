from fastapi import WebSocket, WebSocketDisconnect
from src.modules.notification.notification_manager import NotificationManager

async def notification_ws(WebSocket: WebSocket, user_id: int, manager: NotificationManager):
    await manager.connect(user_id, WebSocket)
    try:
        while True:
            await WebSocket.receive_text()  # Keep the connection alive
    except WebSocketDisconnect:
        manager.disconnect(user_id)