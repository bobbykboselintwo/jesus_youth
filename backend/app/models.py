from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

class StudentRegistrationSchema(BaseModel):
    device_id: str = Field(..., description="Unique Device Token")
    name: str = Field(..., min_length=1, max_length=100, description="First Name")
    surname: str = Field(..., min_length=1, max_length=100, description="Surname")
    phone: str = Field(..., description="Mobile Number")
    email: EmailStr = Field(..., description="Email Address")
    parish: str = Field(..., description="Parish Name")
    diocese: str = Field(..., description="Diocese Name")
    tShirtSize: str = Field(..., description="T-Shirt Size (S, M, L, XL, XXL, 3XL)")
    
    amount: float = Field(default=100.0, description="Registration Fee ₹100")
    regId: Optional[str] = Field(None, description="Unique 6-digit Registration ID (e.g. 100101)")
    paymentRef: Optional[str] = Field(default="DIRECT_UPI", description="Payment Reference")
    paymentStatus: Optional[str] = Field(default="SUBMITTED", description="Payment Status")
    registrationStatus: Optional[str] = Field(default="PENDING", description="PENDING | APPROVED | REJECTED")

    emergencyName: Optional[str] = Field(None, description="Emergency Contact Name")
    emergencyPhone: Optional[str] = Field(None, description="Emergency Contact Phone")
    registeredBy: Optional[str] = Field(None, description="Name of Primary Registrant who added this delegate")
    dataConsent: bool = Field(default=True, description="Data Consent Agreement")

    submittedAt: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())

class AdminActionSchema(BaseModel):
    device_id: str = Field(..., description="Target Device ID or Primary Phone")
    status: str = Field(..., description="APPROVED or REJECTED or PENDING")

class APIResponseSchema(BaseModel):
    status: str
    message: str
    registration_id: Optional[str] = None
    regId: Optional[str] = None

