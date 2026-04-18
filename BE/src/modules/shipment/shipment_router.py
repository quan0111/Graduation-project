from fastapi import APIRouter
from typing import List
from src.modules.shipment.shipment_service import ShipmentService
from src.modules.shipment.shipment_schema import ShipmentCreate, ShipmentUpdate, ShipmentOut

router = APIRouter(prefix="/shipments", tags=["Shipments"])


@router.post("/", response_model=ShipmentOut)
async def create_shipment(data: ShipmentCreate):
    return await ShipmentService.create_shipment(data)


@router.get("/order/{order_id}", response_model=ShipmentOut)
async def get_shipment(order_id: int):
    return await ShipmentService.get_shipment(order_id)


@router.patch("/order/{order_id}", response_model=ShipmentOut)
async def update_shipment(order_id: int, data: ShipmentUpdate):
    return await ShipmentService.update_shipment(order_id, data)



@router.get("/track/{tracking_number}", response_model=ShipmentOut)
async def track_shipment(tracking_number: str):
    return await ShipmentService.track_shipment(tracking_number)

@router.get("/", response_model=List[ShipmentOut])
async def get_all_shipments():
    return await ShipmentService.get_all_shipments()