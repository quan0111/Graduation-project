import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=os.getenv("CLOUDINARY_SECURE") == "True"
)


def is_cloudinary_configured() -> bool:
    return bool(
        os.getenv("CLOUDINARY_CLOUD_NAME")
        and os.getenv("CLOUDINARY_API_KEY")
        and os.getenv("CLOUDINARY_API_SECRET")
    )


async def upload_image(file: UploadFile, folder: str = "datn") -> dict:
    if not is_cloudinary_configured():
        raise HTTPException(500, "Cloudinary is not configured")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image uploads are supported")

    content = await file.read()
    if not content:
        raise HTTPException(400, "Uploaded file is empty")

    try:
        result = cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type="image",
        )
    except Exception as exc:
        raise HTTPException(500, f"Upload failed: {exc}") from exc

    return {
        "url": result.get("secure_url"),
        "publicId": result.get("public_id"),
        "width": result.get("width"),
        "height": result.get("height"),
        "format": result.get("format"),
    }
