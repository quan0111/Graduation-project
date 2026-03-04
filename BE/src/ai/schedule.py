import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from src.ai.train import train_model

scheduler = AsyncIOScheduler()

async def start_scheduler():
    scheduler.add_job(train_model, 'interval', hours=6)  # 
    scheduler.start()
    print("Scheduler started. Model will be retrained every 6 hours.")
async def stop_scheduler():
    scheduler.shutdown()
    print("Scheduler stopped.")
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    start_scheduler()
    loop.run_forever()