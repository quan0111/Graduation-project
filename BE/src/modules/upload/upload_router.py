from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from src.core.cloudinary import upload_image
from src.core.dependencies import get_current_user

router = APIRouter(prefix="/uploads", tags=["Uploads"])

MAX_IMAGE_SIZE = 5 * 1024 * 1024
ALLOWED_FOLDERS = {"datn", "reviews", "returns", "products", "avatars", "shops", "seller-identity"}


@router.post("/image")
async def upload_single_image(
    file: UploadFile = File(...),
    folder: str = Form("datn"),
    user=Depends(get_current_user),
):
    _ = user
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(400, "Invalid upload folder")
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image uploads are allowed")

    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(413, "Image is too large")
    await file.seek(0)

    return await upload_image(file, folder=folder)
