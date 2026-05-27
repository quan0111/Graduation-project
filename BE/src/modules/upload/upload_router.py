from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from src.core.cloudinary import upload_file, upload_image, upload_media
from src.core.dependencies import get_current_user

router = APIRouter(prefix="/uploads", tags=["Uploads"])

MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_VIDEO_SIZE = 50 * 1024 * 1024
MAX_FILE_SIZE = 20 * 1024 * 1024
ALLOWED_FOLDERS = {
    "datn",
    "datn/admins",
    "datn/banners",
    "datn/shops",
    "datn/users",
    "reviews",
    "returns",
    "products",
    "avatars",
    "shops",
    "seller-identity",
    "moderation",
    "datn/moderation",
}
ALLOWED_FILE_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
}


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


@router.post("/media")
async def upload_single_media(
    file: UploadFile = File(...),
    folder: str = Form("datn"),
    user=Depends(get_current_user),
):
    _ = user
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(400, "Invalid upload folder")
    if not file.content_type or not (
        file.content_type.startswith("image/") or file.content_type.startswith("video/")
    ):
        raise HTTPException(400, "Only image and video uploads are allowed")

    content = await file.read()
    max_size = MAX_VIDEO_SIZE if file.content_type.startswith("video/") else MAX_IMAGE_SIZE
    if len(content) > max_size:
        raise HTTPException(413, "File is too large")
    await file.seek(0)

    return await upload_media(file, folder=folder)


@router.post("/file")
async def upload_single_file(
    file: UploadFile = File(...),
    folder: str = Form("datn"),
    user=Depends(get_current_user),
):
    _ = user
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(400, "Invalid upload folder")

    content_type = file.content_type or "application/octet-stream"
    is_supported_media = content_type.startswith("image/") or content_type.startswith("video/")
    if not is_supported_media and content_type not in ALLOWED_FILE_CONTENT_TYPES:
        raise HTTPException(400, "Only image, video, PDF, Word, Excel and text files are allowed")

    content = await file.read()
    max_size = MAX_VIDEO_SIZE if content_type.startswith("video/") else MAX_FILE_SIZE
    if len(content) > max_size:
        raise HTTPException(413, "File is too large")
    await file.seek(0)

    return await upload_file(file, folder=folder)
