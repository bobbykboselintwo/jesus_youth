import csv
import io
from fastapi import APIRouter, HTTPException, Query, Response
from app.models import StudentRegistrationSchema, AdminActionSchema, APIResponseSchema
from app.database import get_collection, db
from datetime import datetime

router = APIRouter(prefix="/api", tags=["Registrations"])

@router.post("/register", response_model=APIResponseSchema, status_code=201)
async def register_student(payload: StudentRegistrationSchema):
    try:
        seq_str = "0001"
        if db.client is None:
            demo_reg_id = payload.regId or f"{payload.name}-{payload.surname}-{payload.phone}-{payload.email}-0001"
            return APIResponseSchema(
                status="success",
                message="Registration received (demo mode).",
                registration_id=demo_reg_id,
                regId=demo_reg_id
            )

        collection = get_collection("registrations")
        
        doc = payload.model_dump()
        doc["email"] = payload.email.lower()
        doc["updatedAt"] = datetime.utcnow()

        # Check for existing registration by device_id only
        existing = await collection.find_one({
            "device_id": payload.device_id
        })

        if existing:
            assigned_reg_id = existing.get("regId")
            if not assigned_reg_id:
                count = await collection.count_documents({})
                seq_str = f"{count + 1:04d}"
                assigned_reg_id = f"{payload.name}-{payload.surname}-{payload.phone}-{payload.email}-{seq_str}"
            doc["regId"] = assigned_reg_id
            await collection.update_one({"_id": existing["_id"]}, {"$set": doc})
            return APIResponseSchema(
                status="success",
                message="Registration details updated successfully!",
                registration_id=str(existing["_id"]),
                regId=assigned_reg_id
            )

        # Assign new unique Registration ID in format: First-Last-Phone-Email-0001
        count = await collection.count_documents({})
        seq_str = f"{count + 1:04d}"
        assigned_reg_id = payload.regId or f"{payload.name}-{payload.surname}-{payload.phone}-{payload.email}-{seq_str}"
        doc["regId"] = assigned_reg_id
        doc["createdAt"] = datetime.utcnow()
        result = await collection.insert_one(doc)
        return APIResponseSchema(
            status="success",
            message="Student registration saved to MongoDB Atlas!",
            registration_id=str(result.inserted_id),
            regId=assigned_reg_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save registration: {str(e)}")


@router.get("/status/{device_id}")
async def get_registration_status(device_id: str):
    if db.client is None:
        return {"registered": False, "status": None}

    collection = get_collection("registrations")
    search_query = device_id.strip()
    doc = await collection.find_one({
        "$or": [
            {"device_id": search_query},
            {"phone": search_query},
            {"regId": search_query},
            {"regId": {"$regex": f"^{search_query}$", "$options": "i"}}
        ]
    })

    if not doc:
        return {"registered": False, "status": None}

    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return {
        "registered": True,
        "status": doc.get("registrationStatus", "PENDING"),
        "registration": doc
    }


@router.get("/admin/registrations")
async def list_admin_registrations(q: str = Query(None), status: str = Query("ALL")):
    if db.client is None:
        return []

    collection = get_collection("registrations")
    query = {}

    if status and status.upper() != "ALL":
        query["registrationStatus"] = status.upper()

    if q:
        regex_pattern = {"$regex": q, "$options": "i"}
        query["$or"] = [
            {"name": regex_pattern},
            {"surname": regex_pattern},
            {"parish": regex_pattern},
            {"diocese": regex_pattern},
            {"phone": regex_pattern},
            {"regId": regex_pattern},
            {"paymentRef": regex_pattern}
        ]

    cursor = collection.find(query).sort("createdAt", -1)
    registrations = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        registrations.append(doc)

    return registrations


@router.post("/admin/action")
async def admin_update_status(payload: AdminActionSchema):
    if db.client is None:
        return {"status": "success", "message": "Demo status updated."}

    collection = get_collection("registrations")
    status_upper = payload.status.upper()

    result = await collection.update_many(
        {
            "$or": [
                {"device_id": payload.device_id},
                {"phone": payload.device_id},
                {"regId": payload.device_id}
            ]
        },
        {
            "$set": {
                "registrationStatus": status_upper,
                "updatedAt": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found.")

    return {
        "status": "success",
        "message": f"Status updated to {status_upper}"
    }


@router.get("/export-csv")
async def export_registrations_csv(status: str = Query("ALL")):
    headers = [
        "Registration ID", "Name", "Surname", "Parish", "Diocese", "Phone", "Email",
        "T-Shirt Size", "Registered By / Connected To", "Amount", "Payment Status", "Registration Status",
        "Device ID", "Submitted At"
    ]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)

    if db.client is not None:
        collection = get_collection("registrations")
        query = {}
        if status and status.upper() != "ALL":
            query["registrationStatus"] = status.upper()

        async for doc in collection.find(query).sort("createdAt", -1):
            writer.writerow([
                doc.get("regId", doc.get("registration_id", "")),
                doc.get("name", ""),
                doc.get("surname", ""),
                doc.get("parish", ""),
                doc.get("diocese", ""),
                doc.get("phone", ""),
                doc.get("email", ""),
                doc.get("tShirtSize", ""),
                doc.get("registeredBy", "Primary / Self"),
                doc.get("amount", 100),
                doc.get("paymentStatus", "SUBMITTED"),
                doc.get("registrationStatus", "PENDING"),
                doc.get("device_id", ""),
                doc.get("submittedAt", "")
            ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=Malabar_Campus_Meet_Registrations_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )
