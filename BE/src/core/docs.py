from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi


def custom_openapi(app: FastAPI):
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="DATN E-Commerce API",
        version="1.0.0",
        description="""
        🚀 Production E-Commerce Backend
        
        Features:
        - JWT Authentication
        - Role-based Access Control
        - Product Management
        - AI Recommendation
        - File Upload
        - Real-time Notifications
        
        Built with FastAPI.
        """,
        routes=app.routes,
    )

    # 🔐 Add Bearer JWT Authentication to Swagger
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # Apply global security
    openapi_schema["security"] = [{"BearerAuth": []}]

    # 🖼 Add Swagger logo
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema