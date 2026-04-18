from fastapi import APIRouter, Depends
from typing import List
from src.modules.address.address_service import AddressService
from src.modules.address.address_schema import AddressCreate, AddressUpdate, AddressOut
from src.core.dependencies import get_current_user   

router = APIRouter(prefix="/addresses", tags=["Addresses"])

address_service = AddressService()


# ======================
# CREATE
# ======================
@router.post("/", response_model=AddressOut)
async def create_address(
    address_data: AddressCreate,
    current_user=Depends(get_current_user)
):
    return await address_service.create(current_user.id, address_data)


@router.get("/", response_model=List[AddressOut])
async def get_my_addresses(
    current_user=Depends(get_current_user)
):
    return await address_service.get_by_user(current_user.id)


@router.get("/{address_id}", response_model=AddressOut)
async def get_address_by_id(
    address_id: int,
    current_user=Depends(get_current_user)
):
    return await address_service.get_by_id(current_user.id, address_id)
@router.patch("/{address_id}", response_model=AddressOut)
async def update_address(
    address_id: int,
    address_data: AddressUpdate,
    current_user=Depends(get_current_user)
):
    return await address_service.update(current_user.id, address_id, address_data)


# ======================
# DELETE (SOFT DELETE)
# ======================
@router.delete("/{address_id}")
async def delete_address(
    address_id: int,
    current_user=Depends(get_current_user)
):
    await address_service.delete(current_user.id, address_id)
    return {"message": "Address deleted successfully"}