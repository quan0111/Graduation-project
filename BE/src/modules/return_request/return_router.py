from fastapi import APIRouter, Depends
from typing import List
from src.modules.return_request.return_schema import ReturnRequestCreate, ReturnItemCreate, ReturnEvidenceCreate, ReturnOut
from src.modules.return_request.return_service import ReturnService    

router = APIRouter(prefix="/returns", tags=["Returns"])



@router.post("/")
async def create(data: ReturnRequestCreate, user_id: int):
    return await ReturnService.create_request(user_id, data)


@router.post("/{return_id}/items")
async def add_item(return_id: int, data: ReturnItemCreate):
    return await ReturnService.add_item(return_id, data)


@router.post("/{return_id}/evidence")
async def add_evidence(return_id: int, data: ReturnEvidenceCreate):
    return await ReturnService.add_evidence(return_id, data)


@router.patch("/{return_id}/review")
async def review(return_id: int, admin_id: int, status: str):
    return await ReturnService.review(return_id, admin_id, status)


@router.get("/{return_id}", response_model=ReturnOut)
async def detail(return_id: int):
    return await ReturnService.get_detail(return_id)


@router.get("/user/{user_id}", response_model=List[ReturnOut])
async def get_user_returns(user_id: int):
    return await ReturnService.get_by_user(user_id)