from apscheduler.schedulers.asyncio import AsyncIOScheduler

from src.ai.train import MODEL_PATH, train_model

scheduler = AsyncIOScheduler()


async def start_scheduler():
    if scheduler.running:
        return

    if not MODEL_PATH.exists():
        await train_model()

    scheduler.add_job(train_model, "interval", hours=6, id="recommendation_retrain", replace_existing=True)
    scheduler.start()


async def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
