import argparse
import asyncio
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

from prisma import Json

sys.path.append(str(Path(__file__).resolve().parents[1]))

from src.ai.train import train_model
from src.core.database import prisma
from src.core.security import hash_password
from src.modules.analytics.analytics_service import AnalyticsService


SEED_VERSION = "rec-seed-market-v1"
DEMO_PASSWORD = "Demo@123"

SHOPS = {
    "tech": {
        "seller_email": "rec.seller@markethub.vn",
        "seller_name": "Nguyen Minh Quan",
        "seller_avatar": "https://i.pravatar.cc/300?u=seed-seller-technova",
        "name": "TechNova Gear",
        "slug": "seed-technova-gear",
        "description": "Phu kien cong nghe, gaming gear va do lam viec tai nha.",
        "avatar_url": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80",
    },
    "fashion": {
        "seller_email": "seed.urbanthread@markethub.vn",
        "seller_name": "Tran Bao Anh",
        "seller_avatar": "https://i.pravatar.cc/300?u=seed-seller-urbanthread",
        "name": "Urban Thread Studio",
        "slug": "seed-urban-thread-studio",
        "description": "Thoi trang duong pho, balo va phu kien hang ngay.",
        "avatar_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
    },
    "home": {
        "seller_email": "seed.homenest@markethub.vn",
        "seller_name": "Pham Quoc Huy",
        "seller_avatar": "https://i.pravatar.cc/300?u=seed-seller-homenest",
        "name": "HomeNest Living",
        "slug": "seed-homenest-living",
        "description": "Do nha cua toi gian cho goc lam viec va phong khach.",
        "avatar_url": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80",
    },
    "beauty": {
        "seller_email": "seed.glowlab@markethub.vn",
        "seller_name": "Le Thu Ha",
        "seller_avatar": "https://i.pravatar.cc/300?u=seed-seller-glowlab",
        "name": "Glow Lab Official",
        "slug": "seed-glow-lab-official",
        "description": "Cham soc da co ban, my pham du lich va san pham duong am.",
        "avatar_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
    },
}

CATEGORIES = [
    ("rec-gaming", "Electronics & Gaming"),
    ("rec-fashion", "Fashion & Bags"),
    ("rec-home", "Home & Living"),
    ("rec-beauty", "Beauty & Care"),
]

PRODUCTS = [
    {
        "slug": "rec-demo-keyboard-pro",
        "name": "NovaKey K6 Mechanical Keyboard",
        "shop": "tech",
        "category": "rec-gaming",
        "price": 890000,
        "description": "Ban phim co 84 phim, ket noi Bluetooth/USB-C, switch tactile va keycap PBT.",
        "images": [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Switch Brown", "sku": "SEED-NOVAKEY-K6-BROWN", "stock": 48, "price": 890000, "weight": 0.82},
            {"name": "Switch Red", "sku": "SEED-NOVAKEY-K6-RED", "stock": 36, "price": 910000, "weight": 0.82},
        ],
        "attributes": {"brand": "NovaKey", "connection": "Bluetooth, USB-C", "warranty": "12 months"},
    },
    {
        "slug": "rec-demo-gaming-mouse",
        "name": "AeroClick M2 Wireless Mouse",
        "shop": "tech",
        "category": "rec-gaming",
        "price": 490000,
        "description": "Chuot gaming khong day 59g, cam bien 12K DPI, pin 70 gio.",
        "images": [
            "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Matte Black", "sku": "SEED-AEROCLICK-M2-BLK", "stock": 75, "price": 490000, "weight": 0.18},
            {"name": "Snow White", "sku": "SEED-AEROCLICK-M2-WHT", "stock": 52, "price": 510000, "weight": 0.18},
        ],
        "attributes": {"brand": "AeroClick", "dpi": "12000", "battery": "70 hours"},
    },
    {
        "slug": "rec-demo-headset",
        "name": "PulseWave H7 Bluetooth Headset",
        "shop": "tech",
        "category": "rec-gaming",
        "price": 690000,
        "description": "Tai nghe over-ear co mic loc on, driver 50mm va dem tai mem.",
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Black", "sku": "SEED-PULSEWAVE-H7-BLK", "stock": 42, "price": 690000, "weight": 0.34},
            {"name": "Blue Accent", "sku": "SEED-PULSEWAVE-H7-BLU", "stock": 27, "price": 720000, "weight": 0.34},
        ],
        "attributes": {"brand": "PulseWave", "driver": "50mm", "microphone": "Noise reducing"},
    },
    {
        "slug": "rec-demo-mousepad",
        "name": "ControlDesk XL Desk Mat",
        "shop": "tech",
        "category": "rec-gaming",
        "price": 190000,
        "description": "Lot chuot kich thuoc 900x400mm, be mat speed-control va de cao su chong truot.",
        "images": [
            "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Graphite", "sku": "SEED-CONTROLDESK-XL-GRAPHITE", "stock": 120, "price": 190000, "weight": 0.52},
            {"name": "Navy", "sku": "SEED-CONTROLDESK-XL-NAVY", "stock": 85, "price": 210000, "weight": 0.52},
        ],
        "attributes": {"size": "900x400mm", "surface": "Speed-control", "base": "Anti-slip rubber"},
    },
    {
        "slug": "rec-demo-hoodie",
        "name": "UrbanZip Cotton Hoodie",
        "shop": "fashion",
        "category": "rec-fashion",
        "price": 420000,
        "description": "Ao hoodie cotton fleece, form regular, khoa keo kim loai va tui kangaroo.",
        "images": [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Size M - Charcoal", "sku": "SEED-URBANZIP-M-CHAR", "stock": 34, "price": 420000, "weight": 0.62},
            {"name": "Size L - Charcoal", "sku": "SEED-URBANZIP-L-CHAR", "stock": 28, "price": 420000, "weight": 0.66},
        ],
        "attributes": {"material": "Cotton fleece", "fit": "Regular", "care": "Machine wash cold"},
    },
    {
        "slug": "rec-demo-sneaker",
        "name": "StrideFlex Daily Sneaker",
        "shop": "fashion",
        "category": "rec-fashion",
        "price": 790000,
        "description": "Giay sneaker de EVA nhe, lot dem em va than vai thoang khi.",
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "EU 39", "sku": "SEED-STRIDEFLEX-39", "stock": 24, "price": 790000, "weight": 0.72},
            {"name": "EU 42", "sku": "SEED-STRIDEFLEX-42", "stock": 31, "price": 790000, "weight": 0.78},
        ],
        "attributes": {"upper": "Knit mesh", "sole": "EVA", "use": "Daily walking"},
    },
    {
        "slug": "rec-demo-backpack",
        "name": "MetroPack 20L Backpack",
        "shop": "fashion",
        "category": "rec-fashion",
        "price": 360000,
        "description": "Balo 20L co ngan laptop 15 inch, vai chong nuoc nhe va quai dem.",
        "images": [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Black", "sku": "SEED-METROPACK-20L-BLK", "stock": 55, "price": 360000, "weight": 0.72},
            {"name": "Olive", "sku": "SEED-METROPACK-20L-OLV", "stock": 38, "price": 380000, "weight": 0.72},
        ],
        "attributes": {"capacity": "20L", "laptop": "15 inch", "fabric": "Water-resistant polyester"},
    },
    {
        "slug": "rec-demo-cap",
        "name": "Classic Low Profile Cap",
        "shop": "fashion",
        "category": "rec-fashion",
        "price": 150000,
        "description": "Non cotton 6 panel, day tang dua kim loai va form low profile.",
        "images": [
            "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1595642527925-4d41cb781653?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Black", "sku": "SEED-CLASSIC-CAP-BLK", "stock": 90, "price": 150000, "weight": 0.12},
            {"name": "Sand", "sku": "SEED-CLASSIC-CAP-SAND", "stock": 64, "price": 150000, "weight": 0.12},
        ],
        "attributes": {"material": "Cotton twill", "closure": "Metal buckle", "fit": "Low profile"},
    },
    {
        "slug": "rec-demo-lamp",
        "name": "LumaDesk LED Lamp",
        "shop": "home",
        "category": "rec-home",
        "price": 320000,
        "description": "Den ban LED 3 nhiet do mau, than gap linh hoat va cong sac USB-C.",
        "images": [
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Warm White", "sku": "SEED-LUMADESK-WARM", "stock": 44, "price": 320000, "weight": 0.95},
            {"name": "Graphite", "sku": "SEED-LUMADESK-GRAPHITE", "stock": 39, "price": 340000, "weight": 0.95},
        ],
        "attributes": {"light_modes": "3 temperatures", "charging": "USB-C", "power": "8W"},
    },
    {
        "slug": "rec-demo-chair",
        "name": "ErgoNest Office Chair",
        "shop": "home",
        "category": "rec-home",
        "price": 1650000,
        "description": "Ghe van phong lung luoi, tua dau dieu chinh, de xoay 360 do va tay gat nang ha.",
        "images": [
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Black Mesh", "sku": "SEED-ERGONEST-BLK", "stock": 18, "price": 1650000, "weight": 12.5},
            {"name": "Grey Mesh", "sku": "SEED-ERGONEST-GRY", "stock": 14, "price": 1720000, "weight": 12.5},
        ],
        "attributes": {"material": "Mesh", "load": "120kg", "warranty": "24 months"},
    },
    {
        "slug": "rec-demo-shelf",
        "name": "OakLine Modular Shelf",
        "shop": "home",
        "category": "rec-home",
        "price": 580000,
        "description": "Ke go module 4 tang, lap rap nhanh, phu veneer van soi.",
        "images": [
            "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Natural Oak", "sku": "SEED-OAKLINE-NATURAL", "stock": 26, "price": 580000, "weight": 7.8},
            {"name": "Walnut", "sku": "SEED-OAKLINE-WALNUT", "stock": 19, "price": 620000, "weight": 7.8},
        ],
        "attributes": {"levels": "4", "material": "Engineered wood", "finish": "Veneer"},
    },
    {
        "slug": "rec-demo-cup",
        "name": "Mori Ceramic Mug Set",
        "shop": "home",
        "category": "rec-home",
        "price": 120000,
        "description": "Bo 2 coc su men mo, dung tich 350ml, dung duoc may rua chen.",
        "images": [
            "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Ivory Pair", "sku": "SEED-MORI-MUG-IVORY", "stock": 80, "price": 120000, "weight": 0.55},
            {"name": "Sage Pair", "sku": "SEED-MORI-MUG-SAGE", "stock": 63, "price": 135000, "weight": 0.55},
        ],
        "attributes": {"capacity": "350ml", "set": "2 mugs", "dishwasher_safe": "Yes"},
    },
    {
        "slug": "rec-demo-serum",
        "name": "GlowLab Vitamin C Serum",
        "shop": "beauty",
        "category": "rec-beauty",
        "price": 350000,
        "description": "Serum vitamin C 15%, ket hop HA, phu hop da xam mau va thieu am.",
        "images": [
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "30ml", "sku": "SEED-GLOWLAB-C15-30ML", "stock": 46, "price": 350000, "weight": 0.12},
            {"name": "50ml", "sku": "SEED-GLOWLAB-C15-50ML", "stock": 25, "price": 520000, "weight": 0.18},
        ],
        "attributes": {"active": "15% Vitamin C", "skin_type": "Dull skin", "volume": "30ml"},
    },
    {
        "slug": "rec-demo-sunscreen",
        "name": "Daily Shield SPF50 Sunscreen",
        "shop": "beauty",
        "category": "rec-beauty",
        "price": 260000,
        "description": "Kem chong nang SPF50 PA++++, finish mong nhe, khong nang mat.",
        "images": [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1620917669788-71661edbb5e0?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "50ml", "sku": "SEED-DAILYSHIELD-SPF50-50ML", "stock": 68, "price": 260000, "weight": 0.11},
            {"name": "Twin Pack", "sku": "SEED-DAILYSHIELD-SPF50-TWIN", "stock": 30, "price": 490000, "weight": 0.22},
        ],
        "attributes": {"spf": "50 PA++++", "finish": "Lightweight", "volume": "50ml"},
    },
    {
        "slug": "rec-demo-cleanser",
        "name": "Rice Foam Gentle Cleanser",
        "shop": "beauty",
        "category": "rec-beauty",
        "price": 220000,
        "description": "Sua rua mat tao bot nhe voi chiet xuat gao, khong lam kho da.",
        "images": [
            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "150ml", "sku": "SEED-RICEFOAM-150ML", "stock": 59, "price": 220000, "weight": 0.2},
            {"name": "Travel 80ml", "sku": "SEED-RICEFOAM-80ML", "stock": 70, "price": 150000, "weight": 0.11},
        ],
        "attributes": {"volume": "150ml", "skin_type": "All skin", "ph": "5.5"},
    },
    {
        "slug": "rec-demo-mask",
        "name": "HydraCalm Sheet Mask Pack",
        "shop": "beauty",
        "category": "rec-beauty",
        "price": 99000,
        "description": "Hop 5 mieng mat na duong am, lam diu da sau ngay nang nong.",
        "images": [
            "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80",
        ],
        "variants": [
            {"name": "Pack 5", "sku": "SEED-HYDRACALM-PACK5", "stock": 110, "price": 99000, "weight": 0.18},
            {"name": "Pack 10", "sku": "SEED-HYDRACALM-PACK10", "stock": 65, "price": 179000, "weight": 0.35},
        ],
        "attributes": {"pack": "5 masks", "effect": "Hydrating", "skin_type": "Sensitive"},
    },
]

CUSTOMERS = [
    {"email": "rec.customer01@markethub.vn", "full_name": "Linh Tran", "cluster": "rec-gaming", "holdout": 0},
    {"email": "rec.customer02@markethub.vn", "full_name": "Minh Pham", "cluster": "rec-gaming", "holdout": 1},
    {"email": "rec.customer03@markethub.vn", "full_name": "Hoang Le", "cluster": "rec-gaming", "holdout": 2},
    {"email": "rec.customer04@markethub.vn", "full_name": "Trang Vu", "cluster": "rec-gaming", "holdout": 3},
    {"email": "rec.customer05@markethub.vn", "full_name": "Mai Nguyen", "cluster": "rec-fashion", "holdout": 0},
    {"email": "rec.customer06@markethub.vn", "full_name": "Duc Hoang", "cluster": "rec-fashion", "holdout": 1},
    {"email": "rec.customer07@markethub.vn", "full_name": "Thao Pham", "cluster": "rec-fashion", "holdout": 2},
    {"email": "rec.customer08@markethub.vn", "full_name": "Khoa Tran", "cluster": "rec-fashion", "holdout": 3},
    {"email": "rec.customer09@markethub.vn", "full_name": "An Vo", "cluster": "rec-home", "holdout": 0},
    {"email": "rec.customer10@markethub.vn", "full_name": "Nhi Dang", "cluster": "rec-home", "holdout": 1},
    {"email": "rec.customer11@markethub.vn", "full_name": "Tuan Bui", "cluster": "rec-home", "holdout": 2},
    {"email": "rec.customer12@markethub.vn", "full_name": "Vy Nguyen", "cluster": "rec-home", "holdout": 3},
    {"email": "rec.customer13@markethub.vn", "full_name": "Ha Le", "cluster": "rec-beauty", "holdout": 0},
    {"email": "rec.customer14@markethub.vn", "full_name": "Quynh Pham", "cluster": "rec-beauty", "holdout": 1},
    {"email": "rec.customer15@markethub.vn", "full_name": "Bao Tran", "cluster": "rec-beauty", "holdout": 2},
    {"email": "rec.customer16@markethub.vn", "full_name": "My Nguyen", "cluster": "rec-beauty", "holdout": 3},
]

REVIEW_COMMENTS = [
    "Dong goi can than, dung mo ta va dung mau minh chon.",
    "San pham dung rat on, shop phan hoi nhanh khi can hoi them.",
    "Chat luong tot trong tam gia, giao hang nhanh hon du kien.",
    "Minh da dung vai ngay, cam giac chac chan va dang tien.",
]


def product_map_by_slug():
    return {product["slug"]: product for product in PRODUCTS}


def category_product_slugs():
    grouped = defaultdict(list)
    for product in PRODUCTS:
        grouped[product["category"]].append(product["slug"])
    return grouped


async def upsert_user(email: str, role: str, full_name: str, avatar_url: str | None = None):
    existing = await prisma.user.find_unique(where={"email": email})
    data = {
        "fullName": full_name,
        "phone": "0900000000",
        "avatarUrl": avatar_url,
        "role": role,
        "isActive": True,
        "deletedAt": None,
    }
    if existing:
        if not existing.password:
            data["password"] = hash_password(DEMO_PASSWORD)
        return await prisma.user.update(where={"id": existing.id}, data=data)

    return await prisma.user.create(
        data={
            **data,
            "email": email,
            "password": hash_password(DEMO_PASSWORD),
        }
    )


async def ensure_shops():
    shops = {}
    for key, config in SHOPS.items():
        seller = await upsert_user(
            config["seller_email"],
            "SELLER",
            config["seller_name"],
            config["seller_avatar"],
        )
        shop = await prisma.shop.find_first(where={"ownerId": seller.id})
        data = {
            "name": config["name"],
            "slug": config["slug"],
            "description": config["description"],
            "avatarUrl": config["avatar_url"],
            "isActive": True,
            "deletedAt": None,
        }
        if shop:
            shop = await prisma.shop.update(where={"id": shop.id}, data=data)
        else:
            shop = await prisma.shop.create(data={**data, "ownerId": seller.id})
        shops[key] = shop
    return shops


async def ensure_categories():
    categories = {}
    for slug, name in CATEGORIES:
        category = await prisma.category.find_unique(where={"slug": slug})
        if category:
            category = await prisma.category.update(
                where={"id": category.id},
                data={"name": name, "deletedAt": None},
            )
        else:
            category = await prisma.category.create(data={"name": name, "slug": slug})
        categories[slug] = category
    return categories


async def ensure_product(product_data, shops, categories):
    product = await prisma.product.find_unique(
        where={"slug": product_data["slug"]},
        include={"variants": True, "images": True, "attributes": True},
    )
    data = {
        "name": product_data["name"],
        "description": product_data["description"],
        "price": float(product_data["price"]),
        "status": "ACTIVE",
        "deletedAt": None,
        "shop": {"connect": {"id": shops[product_data["shop"]].id}},
        "category": {"connect": {"id": categories[product_data["category"]].id}},
    }

    if product:
        product = await prisma.product.update(
            where={"id": product.id},
            data=data,
            include={"variants": True, "images": True, "attributes": True},
        )
    else:
        product = await prisma.product.create(
            data={
                **data,
                "slug": product_data["slug"],
            },
            include={"variants": True, "images": True, "attributes": True},
        )

    await ensure_product_images(product, product_data["images"])
    await ensure_product_variants(product, product_data["variants"])
    await ensure_product_attributes(product.id, product_data["attributes"])

    return await prisma.product.find_unique(
        where={"id": product.id},
        include={"variants": True, "images": True, "attributes": True, "shop": True, "category": True},
    )


async def ensure_product_images(product, image_urls):
    existing_images = sorted(
        [image for image in (product.images or []) if image.deletedAt is None],
        key=lambda image: (image.position or 0, image.id),
    )
    for index, url in enumerate(image_urls):
        data = {"url": url, "position": index, "isPrimary": index == 0, "deletedAt": None}
        if index < len(existing_images):
            await prisma.productimage.update(where={"id": existing_images[index].id}, data=data)
        else:
            await prisma.productimage.create(
                data={
                    **data,
                    "product": {"connect": {"id": product.id}},
                }
            )

    if len(existing_images) > len(image_urls):
        for image in existing_images[len(image_urls) :]:
            await prisma.productimage.update(where={"id": image.id}, data={"isPrimary": False})


async def ensure_product_variants(product, variants):
    existing_variants = sorted(
        [variant for variant in (product.variants or []) if variant.deletedAt is None],
        key=lambda variant: variant.id,
    )
    for index, variant_data in enumerate(variants):
        data = {
            "name": variant_data["name"],
            "sku": variant_data["sku"],
            "stock": int(variant_data["stock"]),
            "price": float(variant_data["price"]),
            "weight": float(variant_data["weight"]),
            "deletedAt": None,
        }
        if index < len(existing_variants):
            await prisma.productvariant.update(where={"id": existing_variants[index].id}, data=data)
        else:
            await prisma.productvariant.create(
                data={
                    **data,
                    "product": {"connect": {"id": product.id}},
                }
            )


async def ensure_product_attributes(product_id: int, attributes: dict[str, str]):
    existing = await prisma.productattribute.find_many(
        where={"productId": product_id, "deletedAt": None},
    )
    existing_by_key = {item.key: item for item in existing}
    for key, value in attributes.items():
        current = existing_by_key.get(key)
        if current:
            await prisma.productattribute.update(where={"id": current.id}, data={"value": value, "deletedAt": None})
        else:
            await prisma.productattribute.create(data={"productId": product_id, "key": key, "value": value})

    stale_keys = set(existing_by_key) - set(attributes)
    for key in stale_keys:
        await prisma.productattribute.update(where={"id": existing_by_key[key].id}, data={"deletedAt": datetime.utcnow()})


async def ensure_products(shops, categories):
    products_by_slug = {}
    for product_data in PRODUCTS:
        product = await ensure_product(product_data, shops, categories)
        products_by_slug[product_data["slug"]] = product
    return products_by_slug


async def ensure_customers():
    users = {}
    for index, customer in enumerate(CUSTOMERS, start=1):
        avatar = f"https://i.pravatar.cc/300?u=seed-customer-{index:02d}"
        user = await upsert_user(customer["email"], "CUSTOMER", customer["full_name"], avatar)
        users[customer["email"]] = user
        await ensure_address(user, index)
    return users


async def ensure_address(user, index: int):
    address = await prisma.address.find_first(where={"userId": user.id, "deletedAt": None})
    data = {
        "fullName": user.fullName or f"Seed Customer {index:02d}",
        "phone": f"09{index:08d}"[:10],
        "addressLine": f"{12 + index} Nguyen Trai",
        "ward": f"Ward {index % 12 + 1}",
        "district": "Quan 1" if index % 2 else "Quan 3",
        "province": "TP. Ho Chi Minh",
        "country": "Vietnam",
        "postalCode": "700000",
        "isDefault": True,
        "type": "HOME",
        "deletedAt": None,
    }
    if address:
        return await prisma.address.update(where={"id": address.id}, data=data)
    return await prisma.address.create(data={**data, "userId": user.id})


async def clear_old_seed_behaviors():
    result = await prisma.userbehavior.delete_many(
        where={"OR": [{"sessionId": {"startsWith": "rec-seed-"}}, {"sessionId": {"startsWith": "market-seed-"}}]}
    )
    return result


async def seed_behaviors(products_by_slug, users_by_email):
    grouped = category_product_slugs()
    created_count = 0
    base_time = datetime.utcnow() - timedelta(days=55)

    for index, customer in enumerate(CUSTOMERS, start=1):
        user = users_by_email[customer["email"]]
        slugs = grouped[customer["cluster"]]
        holdout_slug = slugs[customer["holdout"] % len(slugs)]
        session_id = f"{SEED_VERSION}-{index:02d}"

        for product_index, slug in enumerate(slugs):
            product = products_by_slug[slug]
            is_holdout = slug == holdout_slug
            if is_holdout:
                actions = ["VIEW", "CLICK", "ADD_TO_CART", "PURCHASE"]
                duration = 110 + index
                event_day = 35 + index
            elif product_index == (customer["holdout"] + 1) % len(slugs):
                actions = ["VIEW", "CLICK", "ADD_TO_CART"]
                duration = 82 + index
                event_day = 18 + index
            else:
                actions = ["VIEW", "CLICK"]
                duration = 44 + index
                event_day = 8 + index + product_index

            for action_index, action in enumerate(actions):
                await prisma.userbehavior.create(
                    data={
                        "user": {"connect": {"id": user.id}},
                        "product": {"connect": {"id": product.id}},
                        "action": action,
                        "sessionId": session_id,
                        "duration": duration,
                        "metadata": Json(
                            {
                                "seed": SEED_VERSION,
                                "cluster": customer["cluster"],
                                "slot": product_index,
                                "source": "seed_recommendation_data",
                            }
                        ),
                        "createdAt": base_time + timedelta(days=event_day, minutes=product_index * 9 + action_index),
                    }
                )
                created_count += 1

        noise_category = CATEGORIES[index % len(CATEGORIES)][0]
        if noise_category != customer["cluster"]:
            noise_slug = grouped[noise_category][index % len(grouped[noise_category])]
            noise_product = products_by_slug[noise_slug]
            for action_index, action in enumerate(["VIEW", "CLICK"]):
                await prisma.userbehavior.create(
                    data={
                        "user": {"connect": {"id": user.id}},
                        "product": {"connect": {"id": noise_product.id}},
                        "action": action,
                        "sessionId": session_id,
                        "duration": 28 + index,
                        "metadata": Json(
                            {
                                "seed": SEED_VERSION,
                                "cluster": "cross-category",
                                "source": "seed_recommendation_data",
                            }
                        ),
                        "createdAt": base_time + timedelta(days=26 + index, minutes=90 + action_index),
                    }
                )
                created_count += 1

    return created_count


async def seed_orders_reviews_and_wishlists(products_by_slug, users_by_email):
    grouped = category_product_slugs()
    created_orders = 0
    created_reviews = 0
    base_time = datetime.utcnow() - timedelta(days=25)

    for index, customer in enumerate(CUSTOMERS, start=1):
        user = users_by_email[customer["email"]]
        slugs = grouped[customer["cluster"]]
        holdout_slug = slugs[customer["holdout"] % len(slugs)]
        nearby_slug = slugs[(customer["holdout"] + 1) % len(slugs)]
        order_slugs = [holdout_slug]

        if index % 4 == 0:
            next_category = CATEGORIES[(index // 4) % len(CATEGORIES)][0]
            if next_category != customer["cluster"]:
                order_slugs.append(grouped[next_category][index % len(grouped[next_category])])

        address = await ensure_address(user, index)
        order = await ensure_completed_order(
            user=user,
            address=address,
            products_by_slug=products_by_slug,
            order_slugs=order_slugs,
            created_at=base_time + timedelta(days=index),
            order_index=index,
        )
        if order:
            created_orders += 1

        review_created = await ensure_review(
            user=user,
            product=products_by_slug[holdout_slug],
            rating=5 if index % 5 else 4,
            comment=REVIEW_COMMENTS[index % len(REVIEW_COMMENTS)],
            created_at=base_time + timedelta(days=index, hours=8),
        )
        if review_created:
            created_reviews += 1

        await ensure_wishlist_item(user.id, products_by_slug[nearby_slug].id)

    return created_orders, created_reviews


async def ensure_completed_order(user, address, products_by_slug, order_slugs, created_at: datetime, order_index: int):
    first_product = products_by_slug[order_slugs[0]]
    existing = await prisma.order.find_first(
        where={
            "userId": user.id,
            "items": {"some": {"productId": first_product.id}},
            "deletedAt": None,
        },
        include={"packages": True, "payment": True},
    )
    if existing:
        await ensure_packages_for_order(existing.id, order_slugs, products_by_slug, created_at, order_index)
        await ensure_payment_for_order(existing, order_index, created_at)
        return None

    subtotal = 0.0
    order_items = []
    shop_ids = set()
    for slug in order_slugs:
        product = products_by_slug[slug]
        variant = first_active_variant(product)
        image_url = primary_image_url(product)
        quantity = 2 if slug == "rec-demo-mask" else 1
        price = float(variant.price if variant else product.price)
        subtotal += price * quantity
        shop_ids.add(product.shopId)
        order_items.append(
            {
                "shopId": product.shopId,
                "productId": product.id,
                "variantId": variant.id if variant else None,
                "quantity": quantity,
                "price": price,
                "productName": product.name,
                "variantName": variant.name if variant else None,
                "productImage": image_url,
                "createdAt": created_at,
            }
        )

    shipping_fee = 25000.0 if subtotal < 1000000 else 0.0
    total_amount = subtotal + shipping_fee

    order = await prisma.order.create(
        data={
            "userId": user.id,
            "status": "COMPLETED",
            "subtotal": subtotal,
            "shippingFee": shipping_fee,
            "shippingMethod": "GHN Standard",
            "discountAmount": 0,
            "totalAmount": total_amount,
            "shippingAddressId": address.id,
            "createdAt": created_at,
            "items": {"create": order_items},
            "payment": {"create": build_payment_data(total_amount, order_index, created_at)},
        }
    )
    await ensure_packages_for_order(order.id, order_slugs, products_by_slug, created_at, order_index)
    return order


def build_payment_data(total_amount: float, order_index: int, created_at: datetime):
    payment_method = "VNPAY" if order_index % 3 else "COD"
    payment_data = {
        "method": payment_method,
        "status": "SUCCESS",
        "amount": float(total_amount),
        "paidAt": created_at + timedelta(minutes=12),
        "providerOrderId": None,
        "requestId": None,
        "transactionId": None,
    }
    if payment_method != "COD":
        payment_data.update(
            {
                "providerOrderId": f"{SEED_VERSION}-payment-{order_index:03d}",
                "transactionId": f"{SEED_VERSION}-txn-{order_index:03d}",
            }
        )
    return payment_data


async def ensure_payment_for_order(order, order_index: int, created_at: datetime):
    payment_data = build_payment_data(float(order.totalAmount or 0), order_index, created_at)
    if order.payment:
        await prisma.payment.update(where={"id": order.payment.id}, data=payment_data)
    else:
        await prisma.payment.create(
            data={
                **payment_data,
                "order": {"connect": {"id": order.id}},
            }
        )


async def ensure_packages_for_order(order_id: int, order_slugs, products_by_slug, created_at: datetime, order_index: int):
    shop_ids = sorted({products_by_slug[slug].shopId for slug in order_slugs})
    for package_index, shop_id in enumerate(shop_ids, start=1):
        existing = await prisma.ordershoppackage.find_first(where={"orderId": order_id, "shopId": shop_id})
        data = {
            "status": "COMPLETED",
            "carrier": "GHN",
            "trackingNumber": f"GHN{order_id:05d}{package_index:02d}{order_index:02d}",
            "shippedAt": created_at + timedelta(days=1),
            "deliveredAt": created_at + timedelta(days=3),
        }
        if existing:
            await prisma.ordershoppackage.update(where={"id": existing.id}, data=data)
        else:
            await prisma.ordershoppackage.create(
                data={
                    **data,
                    "order": {"connect": {"id": order_id}},
                    "shop": {"connect": {"id": shop_id}},
                }
            )


async def ensure_review(user, product, rating: int, comment: str, created_at: datetime) -> bool:
    existing = await prisma.review.find_first(
        where={"userId": user.id, "productId": product.id, "deletedAt": None},
        include={"media": True, "replies": True},
    )
    if existing:
        review = await prisma.review.update(
            where={"id": existing.id},
            data={
                "rating": rating,
                "comment": comment,
                "isVerifiedPurchase": True,
            },
            include={"media": True, "replies": True},
        )
        created = False
    else:
        review = await prisma.review.create(
            data={
                "user": {"connect": {"id": user.id}},
                "product": {"connect": {"id": product.id}},
                "rating": rating,
                "comment": comment,
                "isVerifiedPurchase": True,
                "createdAt": created_at,
            },
            include={"media": True, "replies": True},
        )
        created = True

    image_url = primary_image_url(product)
    if image_url and not (review.media or []):
        await prisma.reviewmedia.create(
            data={
                "review": {"connect": {"id": review.id}},
                "url": image_url,
                "type": "IMAGE",
                "position": 0,
            }
        )

    if not (review.replies or []):
        shop = await prisma.shop.find_unique(where={"id": product.shopId})
        if shop:
            await prisma.reviewreply.create(
                data={
                    "review": {"connect": {"id": review.id}},
                    "seller": {"connect": {"id": shop.ownerId}},
                    "content": "Cam on ban da danh gia. Shop se tiep tuc cai thien dich vu.",
                    "createdAt": created_at + timedelta(hours=6),
                }
            )
    return created


async def ensure_wishlist_item(user_id: int, product_id: int):
    await prisma.wishlist.upsert(
        where={"userId_productId": {"userId": user_id, "productId": product_id}},
        data={
            "create": {"user": {"connect": {"id": user_id}}, "product": {"connect": {"id": product_id}}},
            "update": {},
        },
    )


def first_active_variant(product):
    variants = sorted(
        [variant for variant in (product.variants or []) if variant.deletedAt is None],
        key=lambda variant: variant.id,
    )
    return variants[0] if variants else None


def primary_image_url(product):
    images = [image for image in (product.images or []) if image.deletedAt is None]
    if not images:
        return None
    primary = sorted(images, key=lambda image: (not image.isPrimary, image.position or 0, image.id))[0]
    return primary.url


async def train_and_print_summary():
    train_summary = await train_model(days_back=180, min_weight=0.1)
    metrics = await AnalyticsService.evaluate_recommendations(k=10, days_back=180)
    print(f"Train summary: {train_summary}")
    print(f"Evaluation summary: {metrics}")


async def main(train: bool, clear_only: bool, train_only: bool):
    await prisma.connect()
    try:
        if clear_only:
            result = await clear_old_seed_behaviors()
            deleted = getattr(result, "count", None)
            print(f"Cleared recommendation seed behavior events: {deleted if deleted is not None else result}")
            return

        if train_only:
            await train_and_print_summary()
            return

        shops = await ensure_shops()
        categories = await ensure_categories()
        products_by_slug = await ensure_products(shops, categories)
        users_by_email = await ensure_customers()
        created_orders, created_reviews = await seed_orders_reviews_and_wishlists(products_by_slug, users_by_email)
        await clear_old_seed_behaviors()
        behavior_count = await seed_behaviors(products_by_slug, users_by_email)

        print(f"Shops ready: {len(shops)}")
        print(f"Products ready: {len(products_by_slug)}")
        print(f"Customers ready: {len(users_by_email)}")
        print(f"Completed orders created: {created_orders}")
        print(f"Verified reviews created: {created_reviews}")
        print(f"Seeded behavior events: {behavior_count}")
        print(f"Demo account password: {DEMO_PASSWORD}")

        if train:
            await train_and_print_summary()
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed realistic marketplace data for recommendation training.")
    parser.add_argument("--train", action="store_true", help="Train recommendation models after seeding.")
    parser.add_argument("--clear", action="store_true", help="Remove only recommendation seed behavior events.")
    parser.add_argument("--train-only", action="store_true", help="Train and evaluate using existing data only.")
    args = parser.parse_args()
    asyncio.run(main(train=args.train, clear_only=args.clear, train_only=args.train_only))
