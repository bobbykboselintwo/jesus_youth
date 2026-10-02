from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, get_collection, db
from app.routes.registration import router as registration_router
from app.ocr_service import parse_any_upi_screenshot, parse_and_validate_payment
from datetime import datetime
from typing import Optional
import anyio

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
    import shutil, sys
    return {
        "status": "THE API IS UP",
        "tesseract": shutil.which("tesseract"),
        "python": sys.version
    }

@app.post("/api/check-upi", tags=["OCR Verification"])
@app.post("/check-upi", tags=["OCR Verification"])
@app.post("/api/check-upi/", tags=["OCR Verification"])
async def check_upi_screenshot_direct(file: UploadFile = File(...)):
    """
    Direct endpoint in main.py for standalone /upi-check inspector tool.
    Extracts Payee Name, Amount, Date & Time, UTR, App Name, and Payment Status from ANY uploaded screenshot.
    """
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty image uploaded.")

        analysis = await anyio.to_thread.run_sync(parse_any_upi_screenshot, contents)
        del contents

        return {
            "status": "success",
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"UPI Screenshot analysis failed: {str(e)}")


@app.post("/api/verify-payment", tags=["OCR Verification"])
@app.post("/verify-payment", tags=["OCR Verification"])
@app.post("/api/verify-payment/", tags=["OCR Verification"])
async def verify_payment_screenshot_direct(
    file: UploadFile = File(...),
    device_id: Optional[str] = Form(None),
    regId: Optional[str] = Form(None),
    expected_amount: Optional[float] = Form(100.0),
    expected_payer_name: Optional[str] = Form(None)
):
    """
    Direct endpoint in main.py for GPay/UPI payment screenshot verification during registration.
    """
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty screenshot file uploaded.")

        verification = await anyio.to_thread.run_sync(parse_and_validate_payment, contents, expected_amount or 100.0, expected_payer_name)
        del contents

        ocr_status = verification["status"]
        ocr_message = verification["message"]

        # Update document in MongoDB Atlas if client is connected and identifier provided
        if db.client is not None and (device_id or regId):
            collection = get_collection("registrations")
            identifier = device_id or regId
            
            update_payload = {
                "ocrStatus": ocr_status,
                "ocrMessage": ocr_message,
                "ocrVerifiedAt": datetime.utcnow().isoformat(),
                "ocrExtractedText": verification.get("raw_text_snippet"),
                "ocrTransactionId": verification.get("transaction_id"),
                "paymentStatus": "VERIFIED" if ocr_status == "APPROVED" else "PENDING_REVIEW",
                "registrationStatus": ocr_status if ocr_status in ["APPROVED", "MANUAL_REVIEW"] else "PENDING",
                "updatedAt": datetime.utcnow()
            }

            await collection.update_many(
                {
                    "$or": [
                        {"device_id": identifier},
                        {"phone": identifier},
                        {"regId": identifier}
                    ]
                },
                {"$set": update_payload}
            )

        return {
            "status": "success",
            "verification": verification,
            "ocrStatus": ocr_status,
            "ocrMessage": ocr_message
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")
