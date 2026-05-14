from fastapi import APIRouter, Depends

from src.core.dependencies import get_current_user, require_admin, require_seller
from src.modules.moderation.moderation_schema import (
    ProductViolationRequest,
    ResolveModerationCaseRequest,
    SellerAppealRequest,
)
from src.modules.moderation.moderation_service import ModerationService

router = APIRouter(prefix="/moderation", tags=["Moderation"])


@router.post("/products/{product_id}/violation")
async def report_product_violation(
    product_id: int,
    body: ProductViolationRequest,
    admin=Depends(require_admin),
):
    return await ModerationService.report_product_violation(
        product_id=product_id,
        admin_id=admin.id,
        status=body.status,
        reason=body.reason,
        violation_type=body.violationType,
        admin_note=body.adminNote,
    )


@router.post("/products/{product_id}/appeal")
async def seller_submit_appeal(
    product_id: int,
    body: SellerAppealRequest,
    seller=Depends(require_seller),
):
    return await ModerationService.seller_submit_appeal(
        product_id=product_id,
        seller_user_id=seller.id,
        seller_note=body.sellerNote,
        evidence=body.evidence,
    )


@router.get("/cases")
async def list_cases(
    status: str | None = None,
    product_id: int | None = None,
    seller_id: int | None = None,
    limit: int = 100,
    admin=Depends(require_admin),
):
    _ = admin
    return await ModerationService.list_cases(status=status, product_id=product_id, seller_id=seller_id, limit=limit)


@router.get("/cases/me")
async def list_my_cases(seller=Depends(require_seller)):
    return await ModerationService.list_cases(seller_id=seller.id, limit=100)


@router.patch("/cases/{case_id}/resolve")
async def resolve_case(
    case_id: int,
    body: ResolveModerationCaseRequest,
    admin=Depends(require_admin),
):
    return await ModerationService.resolve_case(
        case_id=case_id,
        admin_id=admin.id,
        decision=body.decision,
        admin_note=body.adminNote,
    )
