from typing import List

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from src.core.database import prisma
from src.core.dependencies import get_current_user, require_admin, require_seller
from src.core.security import decode_token, verify_token_type
from src.modules.support.support_schema import (
    SupportMessageCreate,
    SupportMessageOut,
    SupportTicketCreate,
    SupportTicketOut,
    SupportTicketUpdate,
)
from src.modules.support.support_realtime import support_realtime_manager
from src.modules.support.support_service import SupportService

router = APIRouter(prefix="/support", tags=["Support"])


@router.websocket("/ws")
async def support_websocket(websocket: WebSocket, token: str):
    payload = decode_token(token)
    if not verify_token_type(payload, "access"):
        await websocket.close(code=1008)
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=1008)
        return

    user = await prisma.user.find_first(where={"id": int(user_id), "isActive": True, "deletedAt": None})
    if not user:
        await websocket.close(code=1008)
        return

    await support_realtime_manager.connect(user.id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        support_realtime_manager.disconnect(user.id, websocket)


@router.post("/tickets", response_model=SupportTicketOut)
async def create_ticket(data: SupportTicketCreate, user=Depends(get_current_user)):
    return await SupportService.create_ticket(user.id, data)


@router.get("/tickets/me", response_model=List[SupportTicketOut])
async def my_tickets(user=Depends(get_current_user)):
    return await SupportService.list_for_user(user.id)


@router.get("/tickets/seller", response_model=List[SupportTicketOut])
async def seller_tickets(user=Depends(require_seller)):
    return await SupportService.list_for_seller(user.id)


@router.get("/tickets/admin", response_model=List[SupportTicketOut])
async def admin_tickets(status: str | None = None, limit: int = 100, user=Depends(require_admin)):
    _ = user
    return await SupportService.list_for_admin(status=status, limit=limit)


@router.get("/tickets/{ticket_id}", response_model=SupportTicketOut)
async def ticket_detail(ticket_id: int, user=Depends(get_current_user)):
    return await SupportService.get_detail(ticket_id, user)


@router.post("/tickets/{ticket_id}/messages", response_model=SupportMessageOut)
async def add_message(ticket_id: int, data: SupportMessageCreate, user=Depends(get_current_user)):
    return await SupportService.add_message(ticket_id, user, data)


@router.patch("/tickets/{ticket_id}", response_model=SupportTicketOut)
async def update_ticket(ticket_id: int, data: SupportTicketUpdate, user=Depends(get_current_user)):
    return await SupportService.update_ticket(ticket_id, user, data)
