from fastapi import APIRouter
from src.modules.address.address_service import AddressService
from src.modules.address.address_schema import AddressCreate, AddressUpdate, AddressOut

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.post("/", response_model=AddressOut)
async def create_address(address_data: AddressCreate):
    new_address = await AddressService.create(address_data)
    return new_address
@router.get("/user/{user_id}", response_model=list[AddressOut])
async def get_addresses_by_user(user_id: int):
    addresses = await AddressService.get_by_user(user_id)
    return addresses
@router.get("/{address_id}", response_model=AddressOut)
async def get_address_by_id(address_id: int):
    address = await AddressService.get_by_id(address_id)
    return address
@router.patch("/{address_id}", response_model=AddressOut)
async def update_address(address_id: int, address_data: AddressUpdate):
    updated_address = await AddressService.update(address_id, address_data)
    return updated_address
@router.patch("/{address_id}/delete")
async def delete_address(address_id: int):
    await AddressService.delete(address_id)
    return {"message": "Address deleted successfully"}