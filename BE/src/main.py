import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.router import api_router
from src.core.config import get_settings
from src.core.docs import custom_openapi
from src.core.lifespan import lifespan
from src.middleware.security_middleware import SecurityMiddleware

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        debug=settings.DEBUG,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ORIGINS,
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
app.add_middleware(SecurityMiddleware)
app.include_router(api_router)
