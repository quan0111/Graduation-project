from fastapi import APIRouter
from typing import List
from src.modules.user_behavior.userBehavior_schema import BehaviorCreate,BehaviorOut
from src.modules.user_behavior.userBehavior_service import BehaviorService

router = APIRouter(prefix="/user-behavior", tags=["User Behavior"])
@router.post("/", response_model=BehaviorOut)
async def create_user_behavior(behavior_data: BehaviorCreate):
    new_behavior = await BehaviorService.create_user_behavior(behavior_data)
    return new_behavior
