from fastapi import APIRouter, Depends, File, Form, UploadFile

from src.core.cloudinary import upload_image
from src.core.dependencies import get_current_user

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.post("/image")
async def upload_single_image(
    file: UploadFile = File(...),
    folder: str = Form("datn"),
    user=Depends(get_current_user),
):
    _ = user
    return await upload_image(file, folder=folder)
