from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes.registration import router as registration_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="FastAPI Backend for KCYM VITAMIN C PAROPPADY registration with MongoDB Integration",
    lifespan=lifespan
)

# Enable CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(registration_router)

@app.get("/health", tags=["Health"])
@app.get("/health/", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "THE API IS UP",
        "message": "THE API IS UP",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION
    }

