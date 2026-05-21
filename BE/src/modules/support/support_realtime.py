from datetime import datetime
from typing import Dict, Iterable, Set

from fastapi import WebSocket


class SupportRealtimeManager:
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

    async def send_to_user(self, user_id: int, payload: dict):
        sockets = list(self.active_connections.get(user_id, set()))
        stale_sockets: list[WebSocket] = []

        for websocket in sockets:
            try:
                await websocket.send_json(payload)
            except Exception:
                stale_sockets.append(websocket)

        for websocket in stale_sockets:
            self.disconnect(user_id, websocket)

    async def send_to_users(self, user_ids: Iterable[int], payload: dict):
        for user_id in set(user_ids):
            await self.send_to_user(user_id, payload)


def _iso(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def _value(value):
    return getattr(value, "value", value)


def serialize_support_message(message) -> dict | None:
    if not message:
        return None

    return {
        "id": message.id,
        "ticketId": message.ticketId,
        "senderId": message.senderId,
        "senderRole": _value(message.senderRole),
        "message": message.message,
        "attachmentUrl": message.attachmentUrl,
        "createdAt": _iso(message.createdAt),
    }


def build_support_message_event(ticket, message) -> dict:
    return {
        "event": "SUPPORT_TICKET.MESSAGE",
        "ticketId": ticket.id,
        "shopId": ticket.shopId,
        "orderId": ticket.orderId,
        "returnRequestId": ticket.returnRequestId,
        "status": _value(ticket.status),
        "message": serialize_support_message(message),
    }


support_realtime_manager = SupportRealtimeManager()
