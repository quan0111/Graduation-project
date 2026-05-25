from apscheduler.schedulers.asyncio import AsyncIOScheduler

from src.ai.train import MODEL_PATH, train_model
from src.modules.order.payment_service import PaymentService

RETRAIN_INTERVAL_HOURS = 6
MISFIRE_GRACE_SECONDS = RETRAIN_INTERVAL_HOURS * 60 * 60
PAYMENT_HOLD_CLEANUP_INTERVAL_MINUTES = 5

scheduler = AsyncIOScheduler(
    job_defaults={
        "coalesce": True,
        "max_instances": 1,
        "misfire_grace_time": MISFIRE_GRACE_SECONDS,
    },
)


async def start_scheduler():
    if scheduler.running:
        return

    if not MODEL_PATH.exists():
        await train_model()

    scheduler.add_job(
        train_model,
        "interval",
        hours=RETRAIN_INTERVAL_HOURS,
        id="recommendation_retrain",
        replace_existing=True,
    )
    scheduler.add_job(
        PaymentService.expire_stale_payment_holds,
        "interval",
        minutes=PAYMENT_HOLD_CLEANUP_INTERVAL_MINUTES,
        id="payment_hold_expire",
        replace_existing=True,
    )
    scheduler.start()


async def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
