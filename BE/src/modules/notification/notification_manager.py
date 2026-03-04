from typing import Dict
from fastapi import WebSocket, WebSocketDisconnect

class NotificationManager:
    def _init_ (self):
        self.active_connections: Dict[int, WebSocket] = {}
    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)
    async def send_notification(self, user_id: int, notification: Dict):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_json(notification)