from datetime import datetime

from fastapi import HTTPException

from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.coupon.coupon_schema import CouponCreate, CouponUpdate


COUPON_SCOPES = {"ORDER", "SHIPPING", "SHOP", "CATEGORY", "PRODUCT"}
COUPON_INCLUDE = {"orders": True, "productTargets": {"include": {"product": True}}}


class CouponService:
    @staticmethod
    def _enum_value(value):
        return getattr(value, "value", value)

    @staticmethod
    async def _get_seller_shop(user_id: int):
        shop = await prisma.shop.find_first(
            where={"ownerId": user_id, "deletedAt": None}
        )
        if not shop:
            raise HTTPException(404, "Shop not found")
        return shop

    @staticmethod
    def _coupon_scope(coupon) -> str:
        scope = str(getattr(coupon, "scope", None) or "ORDER").upper()
        if scope in COUPON_SCOPES:
            return scope
        if getattr(coupon, "applicableShopId", None):
            return "SHOP"
        if getattr(coupon, "applicableCategoryId", None):
            return "CATEGORY"
        if getattr(coupon, "applicableProductId", None):
            return "PRODUCT"
        return "ORDER"

    @staticmethod
    def _coupon_product_ids(coupon) -> set[int]:
        product_ids = set()
        for target in getattr(coupon, "productTargets", None) or []:
            product_id = target.get("productId") if isinstance(target, dict) else getattr(target, "productId", None)
            if product_id:
                product_ids.add(int(product_id))
        legacy_product_id = getattr(coupon, "applicableProductId", None)
        if legacy_product_id:
            product_ids.add(int(legacy_product_id))
        return product_ids

    @staticmethod
    def _serialize_coupon(coupon):
        data = coupon.model_dump() if hasattr(coupon, "model_dump") else dict(coupon)
        product_targets = data.get("productTargets") or []
        product_ids = [
            int(target["productId"])
            for target in product_targets
            if target.get("productId")
        ]
        if data.get("applicableProductId") and int(data["applicableProductId"]) not in product_ids:
            product_ids.append(int(data["applicableProductId"]))
        data["applicableProductIds"] = product_ids
        return data

    @staticmethod
    def _normalize_scope(data: dict) -> str:
        scope = str(CouponService._enum_value(data.get("scope")) or "").upper()
        if scope:
            if scope not in COUPON_SCOPES:
                raise HTTPException(400, "Invalid coupon scope")
            return scope
        if data.get("applicableShopId"):
            return "SHOP"
        if data.get("applicableCategoryId"):
            return "CATEGORY"
        if data.get("applicableProductId") or data.get("applicableProductIds"):
            return "PRODUCT"
        return "ORDER"

    @staticmethod
    async def _assert_product_targets(client, product_ids: list[int], shop_id: int | None = None):
        normalized_ids = list(dict.fromkeys(int(product_id) for product_id in product_ids if product_id))
        if not normalized_ids:
            return []

        products = await client.product.find_many(where={"id": {"in": normalized_ids}, "deletedAt": None})
        if len(products) != len(normalized_ids):
            raise HTTPException(404, "One or more selected products were not found")

        if shop_id is not None:
            invalid_product = next((product for product in products if product.shopId != shop_id), None)
            if invalid_product:
                raise HTTPException(403, "Selected product does not belong to this shop")

        return normalized_ids

    @staticmethod
    async def _replace_product_targets(client, coupon_id: int, product_ids: list[int]):
        await client.couponproducttarget.delete_many(where={"couponId": coupon_id})
        for product_id in product_ids:
            await client.couponproducttarget.create(
                data={
                    "coupon": {"connect": {"id": coupon_id}},
                    "product": {"connect": {"id": product_id}},
                }
            )

    @staticmethod
    async def _assert_write_access(coupon, current_user):
        role = get_role_value(current_user)
        if role == "ADMIN":
            return
        if role != "SELLER":
            raise HTTPException(403, "Forbidden")

        shop = await CouponService._get_seller_shop(current_user.id)
        if coupon.applicableShopId != shop.id:
            raise HTTPException(403, "Forbidden")

    @staticmethod
    async def create_coupon(data: CouponCreate, current_user):
        coupon_code = data.code.upper()
        existing = await prisma.coupon.find_unique(where={"code": coupon_code})
        if existing:
            raise HTTPException(400, "Coupon code already exists")

        payload = data.model_dump(exclude_none=True)
        product_ids = payload.pop("applicableProductIds", []) or []
        if payload.get("applicableProductId"):
            product_ids.append(payload["applicableProductId"])
        product_ids = list(dict.fromkeys(int(product_id) for product_id in product_ids if product_id))
        payload["code"] = coupon_code
        if "discountType" in payload:
            payload["discountType"] = CouponService._enum_value(payload["discountType"])
        if "scope" in payload:
            payload["scope"] = CouponService._enum_value(payload["scope"])

        role = get_role_value(current_user)
        target_shop_id = None
        if role == "SELLER":
            shop = await CouponService._get_seller_shop(current_user.id)
            target_shop_id = shop.id
            if data.applicableShopId is not None and data.applicableShopId != shop.id:
                raise HTTPException(403, "Forbidden")
            payload["applicableShopId"] = shop.id
            payload["scope"] = "PRODUCT" if product_ids else "SHOP"
        else:
            if product_ids and not payload.get("scope"):
                payload["scope"] = "PRODUCT"
            payload["scope"] = CouponService._normalize_scope(payload)

        product_ids = await CouponService._assert_product_targets(prisma, product_ids, target_shop_id)
        if product_ids and not payload.get("applicableProductId"):
            payload["applicableProductId"] = product_ids[0]
        CouponService._validate_scope_payload(payload, product_ids)
        coupon = await prisma.coupon.create(data=payload)
        await CouponService._replace_product_targets(prisma, coupon.id, product_ids)
        return CouponService._serialize_coupon(
            await prisma.coupon.find_unique(where={"id": coupon.id}, include=COUPON_INCLUDE)
        )

    @staticmethod
    def _validate_scope_payload(payload: dict, product_ids: list[int] | None = None):
        scope = payload.get("scope", "ORDER")
        if scope == "SHIPPING":
            payload["applicableShopId"] = None
            payload["applicableCategoryId"] = None
            payload["applicableProductId"] = None
            return
        if scope == "SHOP" and not payload.get("applicableShopId"):
            raise HTTPException(400, "Shop coupon requires applicableShopId")
        if scope == "CATEGORY" and not payload.get("applicableCategoryId"):
            raise HTTPException(400, "Category coupon requires applicableCategoryId")
        if scope == "PRODUCT" and not (payload.get("applicableProductId") or product_ids):
            raise HTTPException(400, "Product coupon requires at least one selected product")

    @staticmethod
    async def get_all_coupons():
        coupons = await prisma.coupon.find_many(include=COUPON_INCLUDE)
        return [CouponService._serialize_coupon(coupon) for coupon in coupons]

    @staticmethod
    async def get_coupon(coupon_id: int):
        coupon = await prisma.coupon.find_unique(
            where={"id": coupon_id},
            include=COUPON_INCLUDE,
        )
        if not coupon:
            raise HTTPException(404, "Coupon not found")
        return CouponService._serialize_coupon(coupon)

    @staticmethod
    async def get_coupon_by_code(code: str):
        coupon = await prisma.coupon.find_unique(where={"code": code.upper()}, include=COUPON_INCLUDE)
        if not coupon:
            raise HTTPException(404, "Coupon not found")
        return CouponService._serialize_coupon(coupon)

    @staticmethod
    async def update_coupon(coupon_id: int, data: CouponUpdate, current_user):
        existing = await prisma.coupon.find_unique(where={"id": coupon_id})
        if not existing:
            raise HTTPException(404, "Coupon not found")
        await CouponService._assert_write_access(existing, current_user)

        payload = data.model_dump(exclude_unset=True, exclude_none=True)
        has_product_ids_update = "applicableProductIds" in payload
        product_ids = payload.pop("applicableProductIds", None)
        if product_ids is not None:
            product_ids = list(dict.fromkeys(int(product_id) for product_id in product_ids if product_id))
        if "discountType" in payload:
            payload["discountType"] = CouponService._enum_value(payload["discountType"])
        if "scope" in payload:
            payload["scope"] = str(CouponService._enum_value(payload["scope"])).upper()

        shop_id = existing.applicableShopId if get_role_value(current_user) != "ADMIN" else None
        if has_product_ids_update:
            product_ids = await CouponService._assert_product_targets(prisma, product_ids or [], shop_id)
            payload["applicableProductId"] = product_ids[0] if product_ids else None
            if product_ids and "scope" not in payload:
                payload["scope"] = "PRODUCT"

        if payload or has_product_ids_update:
            merged = existing.model_dump()
            merged.update(payload)
            if has_product_ids_update:
                merged["applicableProductIds"] = product_ids or []
            merged["scope"] = CouponService._normalize_scope(merged)
            CouponService._validate_scope_payload(merged, product_ids)
            payload["scope"] = merged["scope"]

        await prisma.coupon.update(where={"id": coupon_id}, data=payload)
        if has_product_ids_update:
            await CouponService._replace_product_targets(prisma, coupon_id, product_ids or [])
        return CouponService._serialize_coupon(
            await prisma.coupon.find_unique(where={"id": coupon_id}, include=COUPON_INCLUDE)
        )

    @staticmethod
    async def delete_coupon(coupon_id: int, current_user):
        existing = await prisma.coupon.find_unique(where={"id": coupon_id})
        if not existing:
            raise HTTPException(404, "Coupon not found")
        await CouponService._assert_write_access(existing, current_user)

        return await prisma.coupon.update(
            where={"id": coupon_id},
            data={"isActive": False},
        )

    @staticmethod
    async def activate_coupon(coupon_id: int, current_user):
        existing = await prisma.coupon.find_unique(where={"id": coupon_id})
        if not existing:
            raise HTTPException(404, "Coupon not found")
        await CouponService._assert_write_access(existing, current_user)

        await prisma.coupon.update(where={"id": coupon_id}, data={"isActive": True})
        return CouponService._serialize_coupon(
            await prisma.coupon.find_unique(where={"id": coupon_id}, include=COUPON_INCLUDE)
        )

    @staticmethod
    async def deactivate_coupon(coupon_id: int, current_user):
        existing = await prisma.coupon.find_unique(where={"id": coupon_id})
        if not existing:
            raise HTTPException(404, "Coupon not found")
        await CouponService._assert_write_access(existing, current_user)

        await prisma.coupon.update(where={"id": coupon_id}, data={"isActive": False})
        return CouponService._serialize_coupon(
            await prisma.coupon.find_unique(where={"id": coupon_id}, include=COUPON_INCLUDE)
        )

    @staticmethod
    async def validate_coupon(
        code: str,
        order_amount: float,
        user_id: int | None = None,
        shop_ids: list[int] | None = None,
    ):
        coupon = await prisma.coupon.find_unique(where={"code": code.upper()})

        if not coupon:
            raise HTTPException(404, "Coupon not found")

        await CouponService._validate_common(prisma, coupon, user_id)

        if coupon.minOrderAmount and order_amount < coupon.minOrderAmount:
            raise HTTPException(400, "Order not eligible")

        normalized_shop_ids = {int(shop_id) for shop_id in shop_ids or [] if shop_id}
        scope = CouponService._coupon_scope(coupon)
        if scope == "SHOP":
            if not normalized_shop_ids:
                raise HTTPException(400, "Coupon requires shop context")
            if any(shop_id != coupon.applicableShopId for shop_id in normalized_shop_ids):
                raise HTTPException(400, "Coupon is not applicable to this shop")

        return coupon

    @staticmethod
    async def _validate_common(client, coupon, user_id: int | None = None):
        if not coupon.isActive:
            raise HTTPException(400, "Coupon inactive")

        now = datetime.utcnow()
        if coupon.validFrom and coupon.validFrom > now:
            raise HTTPException(400, "Coupon not started")
        if coupon.validUntil and coupon.validUntil < now:
            raise HTTPException(400, "Coupon expired")
        if coupon.usageLimit and coupon.usedCount >= coupon.usageLimit:
            raise HTTPException(400, "Coupon limit reached")

        if user_id is not None and coupon.usageLimitPerUser:
            used_by_user = await client.couponredemption.count(
                where={"couponId": coupon.id, "userId": user_id}
            )
            if used_by_user >= coupon.usageLimitPerUser:
                raise HTTPException(400, "Coupon usage limit reached for this user")

    @staticmethod
    def calculate_discount(coupon, order_amount: float):
        order_amount = max(float(order_amount or 0), 0)
        if order_amount <= 0:
            return 0

        discount_type = coupon.get("discountType") if isinstance(coupon, dict) else coupon.discountType
        discount_value = coupon.get("discountValue") if isinstance(coupon, dict) else coupon.discountValue
        max_discount = coupon.get("maxDiscount") if isinstance(coupon, dict) else coupon.maxDiscount

        if discount_type == "PERCENTAGE":
            discount = order_amount * (discount_value / 100)
            if max_discount:
                discount = min(discount, max_discount)
        else:
            discount = discount_value

        return max(0, min(float(discount or 0), order_amount))

    @staticmethod
    async def _normalize_stack_items(client, items: list):
        normalized = []
        for item in items or []:
            data = item.model_dump() if hasattr(item, "model_dump") else dict(item)
            product_id = int(data.get("productId") or 0)
            if not product_id:
                continue

            category_id = data.get("categoryId")
            shop_id = int(data.get("shopId") or 0)
            if category_id is None or not shop_id:
                product = await client.product.find_unique(where={"id": product_id})
                if not product:
                    raise HTTPException(404, "Product not found")
                category_id = category_id or product.categoryId
                shop_id = shop_id or product.shopId

            quantity = max(int(data.get("quantity") or 1), 1)
            line_total = data.get("lineTotal")
            if line_total is None:
                line_total = float(data.get("price") or 0) * quantity

            normalized.append(
                {
                    "productId": product_id,
                    "variantId": data.get("variantId"),
                    "shopId": shop_id,
                    "categoryId": int(category_id) if category_id is not None else None,
                    "quantity": quantity,
                    "lineTotal": max(float(line_total or 0), 0),
                }
            )

        return normalized

    @staticmethod
    def _target_amount_for_coupon(coupon, scope: str, items: list[dict], subtotal: float, shipping_fee: float) -> float:
        if scope == "SHIPPING":
            return max(float(shipping_fee or 0), 0)
        if scope == "SHOP":
            shop_id = getattr(coupon, "applicableShopId", None)
            return sum(item["lineTotal"] for item in items if item["shopId"] == shop_id)
        if scope == "CATEGORY":
            category_id = getattr(coupon, "applicableCategoryId", None)
            return sum(item["lineTotal"] for item in items if item["categoryId"] == category_id)
        if scope == "PRODUCT":
            product_ids = CouponService._coupon_product_ids(coupon)
            return sum(item["lineTotal"] for item in items if item["productId"] in product_ids)
        return max(float(subtotal or 0), 0)

    @staticmethod
    async def _load_stack_coupons(client, coupon_ids: list[int] | None = None, coupon_codes: list[str] | None = None):
        coupons = []
        seen_ids = set()

        for coupon_id in coupon_ids or []:
            if not coupon_id or int(coupon_id) in seen_ids:
                continue
            coupon = await client.coupon.find_unique(where={"id": int(coupon_id)}, include={"productTargets": True})
            if not coupon:
                raise HTTPException(404, "Coupon not found")
            coupons.append(coupon)
            seen_ids.add(coupon.id)

        for raw_code in coupon_codes or []:
            code = str(raw_code or "").strip().upper()
            if not code:
                continue
            coupon = await client.coupon.find_unique(where={"code": code}, include={"productTargets": True})
            if not coupon:
                raise HTTPException(404, f"Coupon {code} not found")
            if coupon.id in seen_ids:
                continue
            coupons.append(coupon)
            seen_ids.add(coupon.id)

        return coupons

    @staticmethod
    async def calculate_coupon_stack(
        client,
        *,
        coupon_ids: list[int] | None = None,
        coupon_codes: list[str] | None = None,
        subtotal: float = 0,
        shipping_fee: float = 0,
        items: list | None = None,
        user_id: int | None = None,
    ):
        coupons = await CouponService._load_stack_coupons(client, coupon_ids, coupon_codes)
        normalized_items = await CouponService._normalize_stack_items(client, items or [])
        subtotal = max(float(subtotal or 0), 0)
        shipping_fee = max(float(shipping_fee or 0), 0)

        shipping_coupon_count = 0
        order_coupon_count = 0
        shop_coupon_keys = set()
        category_coupon_keys = set()
        product_coupon_keys = set()
        product_discount = 0.0
        shipping_discount = 0.0
        applied = []

        for coupon in coupons:
            await CouponService._validate_common(client, coupon, user_id)
            scope = CouponService._coupon_scope(coupon)

            if scope == "SHIPPING":
                shipping_coupon_count += 1
                if shipping_coupon_count > 1:
                    raise HTTPException(400, "Only one shipping voucher can be used")
            elif scope == "SHOP":
                shop_id = getattr(coupon, "applicableShopId", None)
                if not shop_id:
                    raise HTTPException(400, "Shop coupon requires shop target")
                if shop_id in shop_coupon_keys:
                    raise HTTPException(400, "Only one shop voucher can be used per shop")
                shop_coupon_keys.add(shop_id)
            elif scope == "CATEGORY":
                category_id = getattr(coupon, "applicableCategoryId", None)
                if not category_id:
                    raise HTTPException(400, "Category voucher requires category target")
                if category_id in category_coupon_keys:
                    raise HTTPException(400, "Only one system category voucher can be used per category")
                category_coupon_keys.add(category_id)
            elif scope == "PRODUCT":
                product_ids = CouponService._coupon_product_ids(coupon)
                if not product_ids:
                    raise HTTPException(400, "Product voucher requires product target")
                if product_coupon_keys.intersection(product_ids):
                    raise HTTPException(400, "Only one product voucher can be used per product")
                product_coupon_keys.update(product_ids)
            else:
                order_coupon_count += 1
                if order_coupon_count > 1:
                    raise HTTPException(400, "Only one system order voucher can be used")

            target_amount = CouponService._target_amount_for_coupon(
                coupon,
                scope,
                normalized_items,
                subtotal,
                shipping_fee,
            )
            if target_amount <= 0:
                raise HTTPException(400, "Voucher is not applicable to this order")
            if coupon.minOrderAmount and target_amount < coupon.minOrderAmount:
                raise HTTPException(400, "Order not eligible")

            discount = CouponService.calculate_discount(coupon, target_amount)
            if scope == "SHIPPING":
                shipping_discount += discount
            else:
                product_discount += discount

            applied.append(
                {
                    "id": coupon.id,
                    "code": coupon.code,
                    "scope": scope,
                    "discountAmount": discount,
                    "discountType": coupon.discountType,
                    "discountValue": coupon.discountValue,
                    "usageLimit": coupon.usageLimit,
                    "targetAmount": target_amount,
                    "applicableShopId": getattr(coupon, "applicableShopId", None),
                    "applicableCategoryId": getattr(coupon, "applicableCategoryId", None),
                    "applicableProductId": getattr(coupon, "applicableProductId", None),
                    "applicableProductIds": sorted(CouponService._coupon_product_ids(coupon)),
                }
            )

        product_discount = min(product_discount, subtotal)
        shipping_discount = min(shipping_discount, shipping_fee)
        discount_amount = product_discount + shipping_discount

        return {
            "discountAmount": discount_amount,
            "productDiscountAmount": product_discount,
            "shippingDiscountAmount": shipping_discount,
            "appliedCoupons": applied,
        }

    @staticmethod
    async def use_coupon(coupon_id: int, user_id: int | None = None, order_id: int | None = None):
        coupon = await prisma.coupon.find_unique(where={"id": coupon_id})

        if not coupon:
            raise HTTPException(404, "Coupon not found")

        if coupon.usageLimit and coupon.usedCount >= coupon.usageLimit:
            raise HTTPException(400, "Coupon limit reached")

        if user_id is not None and coupon.usageLimitPerUser:
            used_by_user = await prisma.couponredemption.count(
                where={"couponId": coupon_id, "userId": user_id}
            )
            if used_by_user >= coupon.usageLimitPerUser:
                raise HTTPException(400, "Coupon usage limit reached for this user")

        async with prisma.tx() as tx:
            where = {"id": coupon_id}
            if coupon.usageLimit:
                where["usedCount"] = {"lt": coupon.usageLimit}

            updated_count = await tx.coupon.update_many(
                where=where,
                data={"usedCount": {"increment": 1}},
            )
            if updated_count == 0:
                raise HTTPException(400, "Coupon limit reached")
            updated = await tx.coupon.find_unique(where={"id": coupon_id})
            if user_id is not None:
                await tx.couponredemption.create(
                    data={
                        "coupon": {"connect": {"id": coupon_id}},
                        "user": {"connect": {"id": user_id}},
                        **({"order": {"connect": {"id": order_id}}} if order_id else {}),
                    }
                )
            return updated
