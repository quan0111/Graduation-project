from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request

from src.core.dependencies import get_current_user, get_role_value, require_admin, require_seller
from src.modules.return_request.return_schema import (
    GatewayRefundConfirm,
    ReturnEvidenceCreate,
    ReturnItemCreate,
    ReturnOut,
    ReturnRequestCreate,
    ReturnReviewUpdate,
)
from src.modules.return_request.return_service import ReturnService

router = APIRouter(prefix="/returns", tags=["Returns"])


@router.post("/", response_model=ReturnOut)
async def create(data: ReturnRequestCreate, user=Depends(get_current_user)):
    return await ReturnService.create_request(user.id, data)


@router.get("/me", response_model=List[ReturnOut])
async def get_my_returns(user=Depends(get_current_user)):
    return await ReturnService.get_by_user(user.id)


@router.get("/admin", response_model=List[ReturnOut])
async def get_admin_returns(user=Depends(require_admin)):
    _ = user
    return await ReturnService.get_all()


@router.get("/seller", response_model=List[ReturnOut])
async def get_seller_returns(user=Depends(require_seller)):
    return await ReturnService.get_by_seller(user.id)


@router.post("/{return_id}/items")
async def add_item(
    return_id: int,
    data: ReturnItemCreate,
    user=Depends(get_current_user),
):
    return await ReturnService.add_item(return_id, user.id, data)


@router.post("/{return_id}/evidence")
async def add_evidence(
    return_id: int,
    data: ReturnEvidenceCreate,
    user=Depends(get_current_user),
):
    return await ReturnService.add_evidence(return_id, user.id, data)


@router.patch("/{return_id}/review", response_model=ReturnOut)
async def review(
    return_id: int,
    data: ReturnReviewUpdate,
    user=Depends(require_admin),
):
    return await ReturnService.review(return_id, user.id, data)


@router.patch("/{return_id}/gateway-refund", response_model=ReturnOut)
async def confirm_gateway_refund(
    return_id: int,
    data: GatewayRefundConfirm,
    user=Depends(require_admin),
):
    return await ReturnService.confirm_gateway_refund(return_id, user.id, data)


@router.post("/{return_id}/gateway-refund/request", response_model=ReturnOut)
async def request_gateway_refund(
    return_id: int,
    request: Request,
    user=Depends(require_admin),
):
    client_host = request.client.host if request.client else "127.0.0.1"
    return await ReturnService.request_gateway_refund(return_id, user.id, client_host)


@router.patch("/{return_id}/refund", response_model=ReturnOut)
async def refund(return_id: int, user=Depends(require_seller)):
    return await ReturnService.mark_refunded(return_id, user.id)


@router.patch("/{return_id}/pickup", response_model=ReturnOut)
async def pickup(return_id: int, user=Depends(require_seller)):
    return await ReturnService.mark_picked_up(return_id, user.id)


@router.patch("/{return_id}/received", response_model=ReturnOut)
async def received(return_id: int, user=Depends(require_seller)):
    return await ReturnService.mark_received(return_id, user.id)


@router.get("/user/{user_id}", response_model=List[ReturnOut])
async def get_user_returns(user_id: int, user=Depends(get_current_user)):
    if user.id != user_id and get_role_value(user) != "ADMIN":
        raise HTTPException(403, "Forbidden")
    return await ReturnService.get_by_user(user_id)


@router.get("/{return_id}", response_model=ReturnOut)
async def detail(return_id: int, user=Depends(get_current_user)):
    return_request = await ReturnService.get_detail(return_id)
    if get_role_value(user) == "ADMIN" or return_request.userId == user.id:
        return return_request
    if get_role_value(user) == "SELLER":
        seller_returns = await ReturnService.get_by_seller(user.id)
        if any(item.id == return_id for item in seller_returns):
            return return_request
    raise HTTPException(403, "Forbidden")
