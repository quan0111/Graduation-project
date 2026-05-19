from fastapi import APIRouter, Depends
from src.modules.users.user_router import router as user_router
from src.modules.auth.router import router as auth_router
from src.modules.shop.shop_router import router as shop_router
from src.modules.product.product_router import router as product_router
from src.modules.category.category_router import router as category_router
from src.modules.address.address_router import router as address_router
from src.modules.notification.notification_router import router as notification_router
from src.modules.coupon.coupon_router import router as coupon_router
from src.modules.review.review_router import router as review_router
from src.modules.follower.follower_router import router as follower_router
from src.modules.cart.cart_router import router as cart_router
from src.modules.chatbot.chatbot_router import router as chatbot_router
from src.modules.order.order_router import router as order_router
from src.modules.analytics.analytics_router import router as user_behavior_router
from src.modules.shipment.shipment_router import router as shipment_router
from src.modules.seller.seller_router import router as seller_router
from src.modules.marketing.marketing_router import router as marketing_router
from src.modules.finance.finance_router import router as finance_router
from src.modules.flash_sale.flash_sale_router import router as flash_sale_router
from src.modules.admin.admin_router import router as admin_router
from src.modules.return_request.return_router import router as return_router
from src.modules.upload.upload_router import router as upload_router
from src.modules.audit.audit_router import router as audit_router
from src.modules.security.security_router import router as security_router
from src.modules.moderation.moderation_router import router as moderation_router
from src.modules.inventory.inventory_router import router as inventory_router
from src.modules.support.support_router import router as support_router
from src.modules.wishlist.wishlist_router import router as wishlist_router

api_router = APIRouter(prefix="/api/v1")


api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(shop_router)
api_router.include_router(product_router)
api_router.include_router(category_router)
api_router.include_router(address_router)
api_router.include_router(notification_router)
api_router.include_router(coupon_router)
api_router.include_router(review_router)
api_router.include_router(follower_router)
api_router.include_router(user_behavior_router)
api_router.include_router(chatbot_router)
api_router.include_router(shipment_router)
api_router.include_router(cart_router)
api_router.include_router(order_router)
api_router.include_router(seller_router)
api_router.include_router(marketing_router)
api_router.include_router(finance_router)
api_router.include_router(flash_sale_router)
api_router.include_router(admin_router)
api_router.include_router(return_router)
api_router.include_router(upload_router)
api_router.include_router(audit_router)
api_router.include_router(security_router)
api_router.include_router(moderation_router)
api_router.include_router(inventory_router)
api_router.include_router(support_router)
api_router.include_router(wishlist_router)



api_router.get("/", tags=["Root"])(lambda: {"message": "Welcome to the API"})
