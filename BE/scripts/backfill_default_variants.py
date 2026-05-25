import argparse
import asyncio
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

sys.path.append(str(Path(__file__).resolve().parents[1]))

from src.core.database import prisma


DEFAULT_VARIANT_NAME = "Mặc định"


def build_sku(product) -> str:
    base = (getattr(product, "slug", None) or f"product-{product.id}").upper()
    safe = "".join(char if char.isalnum() else "-" for char in base).strip("-")
    return f"{safe[:48]}-DEFAULT"


async def backfill(default_stock: int, dry_run: bool):
    products = await prisma.product.find_many(
        where={"deletedAt": None},
        include={"variants": True},
        order={"id": "asc"},
    )

    targets = [
        product
        for product in products
        if not [variant for variant in (product.variants or []) if not variant.deletedAt]
    ]

    print(f"Found {len(targets)} products without active variants.")
    created = 0

    for product in targets:
        sku = build_sku(product)
        print(f"- Product #{product.id}: {product.name} -> variant '{DEFAULT_VARIANT_NAME}', sku={sku}, stock={default_stock}")
        if dry_run:
            continue

        existing_sku = await prisma.productvariant.find_unique(where={"sku": sku})
        if existing_sku:
            sku = f"{sku}-{product.id}"

        await prisma.productvariant.create(
            data={
                "product": {"connect": {"id": product.id}},
                "name": DEFAULT_VARIANT_NAME,
                "sku": sku,
                "price": float(product.price or 0),
                "stock": int(default_stock),
            }
        )
        created += 1

    if dry_run:
        print("Dry run only. No variants were created.")
    else:
        print(f"Created {created} default variants.")


async def main():
    parser = argparse.ArgumentParser(description="Backfill default variants for products that do not have stock-tracked variants.")
    parser.add_argument("--stock", type=int, default=0, help="Initial stock for created default variants.")
    parser.add_argument("--dry-run", action="store_true", help="Print affected products without writing changes.")
    args = parser.parse_args()

    if args.stock < 0:
        raise SystemExit("--stock must be >= 0")

    await prisma.connect()
    try:
        await backfill(default_stock=args.stock, dry_run=args.dry_run)
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
