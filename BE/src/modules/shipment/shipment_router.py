from typing import List

from fastapi import APIRouter, Depends

from src.core.dependencies import get_current_user
from src.modules.shipment.shipment_schema import ShipmentCreate, ShipmentOut, ShipmentUpdate
from src.modules.shipment.shipment_service import ShipmentService

router = APIRouter(prefix="/shipments", tags=["Shipments"])


@router.post("/", response_model=ShipmentOut)
async def create_shipment(
    data: ShipmentCreate,
    user=Depends(get_current_user),
):
    return await ShipmentService.create_shipment(user, data)


@router.get("/order/{order_id}", response_model=ShipmentOut)
async def get_shipment(order_id: int, user=Depends(get_current_user)):
    return await ShipmentService.get_shipment(order_id, user)


@router.patch("/order/{order_id}", response_model=ShipmentOut)
async def update_shipment(
    order_id: int,
    data: ShipmentUpdate,
    user=Depends(get_current_user),
):
    return await ShipmentService.update_shipment(order_id, user, data)


@router.get("/track/{tracking_number}", response_model=ShipmentOut)
async def track_shipment(tracking_number: str):
    return await ShipmentService.track_shipment(tracking_number)


@router.get("/", response_model=List[ShipmentOut])
async def get_all_shipments():
    return await ShipmentService.get_all_shipments()
