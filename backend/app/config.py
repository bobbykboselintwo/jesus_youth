import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = "KCYM VITAMIN C PAROPPADY registration API"
    PROJECT_VERSION: str = "1.0.0"
    
    # MongoDB connection URL (Pass your MongoDB Atlas or local URI here)
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "jesuyouth")
    
    # CORS Origins (allow frontend dev server and production origins)
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

settings = Settings()
