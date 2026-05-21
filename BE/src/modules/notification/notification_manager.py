from typing import Dict, Set
from fastapi import WebSocket


class NotificationManager:

    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(user_id, set()).add(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket | None = None):
        if websocket is None:
            self.active_connections.pop(user_id, None)
            return

        sockets = self.active_connections.get(user_id)
        if not sockets:
            return

        sockets.discard(websocket)
        if not sockets:
            self.active_connections.pop(user_id, None)

    async def send_notification(self, user_id: int, notification: dict):
        sockets = list(self.active_connections.get(user_id, set()))
        stale_sockets: list[WebSocket] = []

        for websocket in sockets:
            try:
                await websocket.send_json(notification)
            except Exception:
                stale_sockets.append(websocket)

        for websocket in stale_sockets:
            self.disconnect(user_id, websocket)

    async def broadcast(self, notification: dict):
        for user_id in list(self.active_connections.keys()):
            await self.send_notification(user_id, notification)


# 🔥 GLOBAL INSTANCE
notification_manager = NotificationManager()
