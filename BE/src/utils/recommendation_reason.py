import unicodedata
from typing import Dict, List, Optional, Set


def normalize_text(value: str) -> str:
    value = value.lower().replace("đ", "d")
    decomposed = unicodedata.normalize("NFD", value)
    return "".join(char for char in decomposed if unicodedata.category(char) != "Mn")


def shared_tags(product, other_product) -> List[str]:
    product_tags = {
        normalize_text(getattr(tag, "name", "")): getattr(tag, "name", "")
        for tag in getattr(product, "tags", []) or []
        if getattr(tag, "name", None)
    }
    other_tags = {
        normalize_text(getattr(tag, "name", ""))
        for tag in getattr(other_product, "tags", []) or []
        if getattr(tag, "name", None)
    }
    return [product_tags[key] for key in product_tags.keys() & other_tags if product_tags[key]]


def product_reason(product, preferences: Optional[Dict] = None, current_product=None):
    preferences = preferences or {}
    category = getattr(getattr(product, "category", None), "name", None)
    shop = getattr(getattr(product, "shop", None), "name", None)

    if current_product:
        tags = shared_tags(product, current_product)
        if tags:
            return f"Có cùng tag {', '.join(tags[:2])} với sản phẩm bạn đang xem.", "shared_tags"
        if product.categoryId == current_product.categoryId and category:
            return f"Cùng danh mục {category} với sản phẩm bạn đang xem.", "same_category"
        if product.shopId == current_product.shopId and shop:
            return f"Cùng shop {shop}, dễ xem thêm lựa chọn liên quan.", "same_shop"

        current_price = float(getattr(current_product, "price", 0) or 0)
        product_price = float(getattr(product, "price", 0) or 0)
        if current_price > 0 and product_price > 0:
            price_gap = abs(product_price - current_price) / max(current_price, 1)
            if price_gap <= 0.25:
                return "Mức giá gần với sản phẩm bạn đang cân nhắc.", "similar_price"

    category_ids: Set[int] = preferences.get("category_ids") or set()
    shop_ids: Set[int] = preferences.get("shop_ids") or set()
    preferred_tags: Set[str] = preferences.get("tags") or set()
    average_price = float(preferences.get("average_price") or 0)
    product_tags = {normalize_text(getattr(tag, "name", "")) for tag in getattr(product, "tags", []) or []}

    if product.categoryId in category_ids and category:
        return f"Hợp với nhóm {category} bạn hay xem hoặc mua gần đây.", "user_category"
    if product_tags & preferred_tags:
        tag_name = next(iter(product_tags & preferred_tags))
        return f"Khớp với sở thích gần đây qua tag {tag_name}.", "user_tag"
    if product.shopId in shop_ids and shop:
        return f"Bạn từng quan tâm sản phẩm từ shop {shop}.", "user_shop"
    if average_price > 0:
        product_price = float(getattr(product, "price", 0) or 0)
        if product_price > 0 and abs(product_price - average_price) / max(average_price, 1) <= 0.35:
            return "Mức giá gần với thói quen mua sắm của bạn.", "user_price"

    return "Đang được nhiều người quan tâm và phù hợp để tham khảo thêm.", "popular"
