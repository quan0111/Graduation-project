from src.core.database import prisma


class BehaviorService:
    async def create(self, data):
        return await prisma.userbehavior.create(
            data=data.model_dump()
        )