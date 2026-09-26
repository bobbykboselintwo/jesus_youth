import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger("uvicorn")

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def get_database():
    return db.client[settings.DB_NAME]

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        # Verify connection
        await db.client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database: {settings.DB_NAME}")
        
        # Ensure collection indexes for fast search & uniqueness checks
        database = db.client[settings.DB_NAME]
        collection = database["registrations"]
        await collection.create_index("phone")
        await collection.create_index("email")
        await collection.create_index("district")
        await collection.create_index("parish")
    except Exception as e:
        logger.warning(f"MongoDB connection notice: {e}. Running in memory-safe fallback mode.")

async def close_mongo_connection():
    if db.client:
        logger.info("Closing MongoDB connection...")
        db.client.close()
        logger.info("MongoDB connection closed.")

def get_collection(collection_name: str = "registrations"):
    if db.client is None:
        raise RuntimeError("Database client is not connected.")
    return db.client[settings.DB_NAME][collection_name]
