from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from src.core.config import get_settings  # chỉ cần import get_settings
from src.core.lifespan import lifespan
from src.api.router import api_router
from src.core.docs import custom_openapi

settings = get_settings()

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,          # ← sửa ở đây: dùng settings thay vì Settings
        debug=settings.DEBUG,             # ← sửa ở đây
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )
    if settings.DEBUG:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    if settings.DEBUG:
        logging.getLogger("uvicorn.access").setLevel(logging.DEBUG)
        logging.getLogger("fastapi").setLevel(logging.DEBUG)
    app.openapi = lambda: custom_openapi(app)

    return app


app = create_app()

app.include_router(api_router)