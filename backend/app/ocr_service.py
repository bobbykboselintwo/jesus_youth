import re
import io
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("ocr_service")

# Standard expected baseline configuration
EXPECTED_RECIPIENT_NAME = "ABRAHAM JOSEPH THADATHIL"
EXPECTED_UPI_ID = "abrahamjosephthadathil200@okhdfcbank"

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Attempts to preprocess and run OCR on image bytes using Pillow/OpenCV + Tesseract.
    Falls back gracefully if Tesseract binary is unavailable in host environment.
    """
    extracted_text = ""
    
    # Try OpenCV + Tesseract
    try:
        import cv2
        import numpy as np
        import pytesseract

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is not None:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            h, w = gray.shape[:2]
            if w < 1000:
                gray = cv2.resize(gray, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
            
            # Contrast enhancement & OTSU Thresholding
            thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            
            extracted_text = pytesseract.image_to_string(thresh)
            if not extracted_text.strip():
                extracted_text = pytesseract.image_to_string(gray)
    except Exception as e:
        logger.warning(f"OpenCV/Tesseract processing notice: {str(e)}")

    # Fallback using PIL if OpenCV/Tesseract was empty or unavailable
    if not extracted_text.strip():
        try:
            from PIL import Image
            import pytesseract

            image = Image.open(io.BytesIO(image_bytes))
            extracted_text = pytesseract.image_to_string(image)
        except Exception as e:
            logger.warning(f"PIL/Tesseract fallback notice: {str(e)}")

    return extracted_text.strip()


def parse_any_upi_screenshot(image_bytes: bytes) -> Dict[str, Any]:
    """
    General OCR parser for ANY screenshot. Detects:
    1. Is it a UPI payment screenshot?
    2. Recipient Name / Account to which payment was made
    3. Amount paid (₹)
    4. Date & Time of payment
    5. Transaction ID / UTR number
    6. Payment Status & App source (GPay, PhonePe, Paytm, etc.)
    """
    try:
        raw_text = extract_text_from_image(image_bytes)
    except Exception as e:
        logger.warning(f"Failed to extract text from image: {str(e)}")
        raw_text = ""

    text_lower = raw_text.lower()
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]


    # 1. Detect UPI & Payment Apps
    app_detected = "Unknown / General UPI"
    if "google pay" in text_lower or "gpay" in text_lower:
        app_detected = "Google Pay (GPay)"
    elif "phonepe" in text_lower:
        app_detected = "PhonePe"
    elif "paytm" in text_lower:
        app_detected = "Paytm"
    elif "bhim" in text_lower:
        app_detected = "BHIM UPI"
    elif "amazon pay" in text_lower or "amazonpay" in text_lower:
        app_detected = "Amazon Pay"
    elif "powered by upi" in text_lower or "upi" in text_lower:
        app_detected = "UPI App"

    # 2. Is UPI Payment Screenshot?
    upi_keywords = ["upi", "gpay", "google pay", "phonepe", "paytm", "bhim", "paid to", "banking name", "utr", "ref no", "transferred to", "payment successful"]
    is_upi_payment = any(kw in text_lower for kw in upi_keywords) or bool(re.search(r'₹\s*\d+', raw_text))

    # 3. Detect Payment Status
    payment_status = "UNSPECIFIED"
    if any(kw in text_lower for kw in ["paid", "payment successful", "successful", "completed", "transferred to", "sent", "✓"]):
        payment_status = "SUCCESSFUL / PAID"
    elif any(kw in text_lower for kw in ["failed", "declined", "unsuccessful"]):
        payment_status = "FAILED"
    elif any(kw in text_lower for kw in ["pending", "processing", "in progress"]):
        payment_status = "PENDING"

    # 4. Extract Amount
    # Look for ₹ symbol first: e.g. ₹100, ₹ 100, ₹100.00
    amounts_found = []
    currency_matches = re.findall(r'(?:₹|rs\.?|inr)\s*(\d+(?:\.\d{1,2})?)', text_lower)
    for match in currency_matches:
        try:
            amounts_found.append(float(match))
        except ValueError:
            pass

    if not amounts_found:
        # Fallback regex for numbers
        num_matches = re.findall(r'\b(\d{1,6}(?:\.\d{1,2})?)\b', text_lower)
        for match in num_matches:
            try:
                val = float(match)
                if 1 <= val <= 100000:
                    amounts_found.append(val)
            except ValueError:
                pass

    primary_amount = amounts_found[0] if amounts_found else None

    # 5. Extract Recipient Name / Account
    recipient_name = None
    # Pattern A: Look for lines after "Paid to" or "To" or "Banking name:"
    for i, line in enumerate(lines):
        line_l = line.lower()
        if "paid to" in line_l or "transferred to" in line_l or "banking name" in line_l or "receiver" in line_l:
            # Check next line or same line
            cleaned = re.sub(r'^(paid to|transferred to|banking name:?|to:?)\s*', '', line, flags=re.IGNORECASE).strip()
            if cleaned and len(cleaned) > 2 and not cleaned.lower().startswith("banking name"):
                recipient_name = cleaned
                break
            elif i + 1 < len(lines):
                candidate = lines[i + 1].strip()
                if candidate and len(candidate) > 2 and not any(kw in candidate.lower() for kw in ["banking name", "powered by", "upi", "₹"]):
                    recipient_name = candidate
                    break

    # If recipient not found via prefix, check hardcoded or prominent uppercase name candidates
    if not recipient_name:
        if "abraham" in text_lower or "joseph" in text_lower or "thadathil" in text_lower:
            recipient_name = "ABRAHAM JOSEPH THADATHIL"
        else:
            # Look for 2-3 word capitalized lines
            for line in lines:
                if len(line.split()) in [2, 3, 4] and line.isupper() and not any(kw in line.lower() for kw in ["powered", "upi", "google", "paid", "success", "banking"]):
                    recipient_name = line
                    break

    # 6. Extract Date & Time
    date_time_str = None
    # Pattern like "27 September 2026, 2:00 am" or "Sep 27, 2026" or "27/09/2026" or "02:00 PM"
    date_match = re.search(
        r'\b(?:\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}(?:,\s*\d{1,2}:\d{2}\s*(?:am|pm)?)?|\d{1,2}/\d{1,2}/\d{2,4}(?:\s+\d{1,2}:\d{2}\s*(?:am|pm)?)?|\d{1,2}:\d{2}\s*(?:am|pm))\b',
        raw_text,
        re.IGNORECASE
    )
    if date_match:
        date_time_str = date_match.group(0)

    # 7. Extract UTR / Transaction ID (12-digit UPI reference number)
    utr_match = re.search(r'\b\d{12}\b', raw_text)
    transaction_id = utr_match.group(0) if utr_match else None

    return {
        "is_upi_payment": is_upi_payment,
        "app_detected": app_detected,
        "payment_status": payment_status,
        "recipient_name": recipient_name or "Not Extracted",
        "amount": primary_amount,
        "amounts_found": amounts_found,
        "date_time": date_time_str or "Not Extracted",
        "transaction_id": transaction_id or "Not Extracted",
        "raw_text": raw_text if raw_text else "No text extracted from image"
    }


def parse_and_validate_payment(
    image_bytes: bytes,
    expected_amount: float = 100.0
) -> Dict[str, Any]:
    """
    Parses OCR text and applies deterministic verification rules for event registration.
    """
    parsed_info = parse_any_upi_screenshot(image_bytes)
    raw_text = parsed_info["raw_text"]
    text_lower = raw_text.lower()

    has_success_indicator = parsed_info["payment_status"] == "SUCCESSFUL / PAID"
    has_upi_indicator = parsed_info["is_upi_payment"]

    recipient_keywords = ["abraham", "joseph", "thadathil", "okhdfcbank"]
    matched_recipient_count = sum(1 for kw in recipient_keywords if kw in text_lower)
    has_recipient_match = matched_recipient_count >= 2 or "abraham joseph" in text_lower or "thadathil" in text_lower

    amounts_found = parsed_info["amounts_found"]
    amount_matches_expected = any(abs(amt - expected_amount) < 0.01 for amt in amounts_found)

    primary_amount = parsed_info["amount"]

    # Decision Engine:
    if primary_amount is not None and not amount_matches_expected:
        status = "REJECTED"
        message = f"❌ Payment Rejected: Screenshot shows payment of ₹{primary_amount}, but required fee is ₹{expected_amount}."
    elif amount_matches_expected and has_recipient_match and (has_success_indicator or has_upi_indicator):
        status = "APPROVED"
        message = f"✅ Payment Verified: ₹{expected_amount} paid to ABRAHAM JOSEPH THADATHIL."
    else:
        status = "MANUAL_REVIEW"
        message = f"⚡ Screenshot received (Extracted Amount: ₹{primary_amount if primary_amount is not None else 'Unclear'}); queued for Admin review."


    return {
        "status": status,
        "message": message,
        "ocr_detected": bool(raw_text),
        "raw_text_snippet": raw_text[:300] if raw_text else "No text extracted via OCR engine",
        "has_success_indicator": has_success_indicator,
        "has_upi_indicator": has_upi_indicator,
        "has_recipient_match": has_recipient_match,
        "amounts_found": amounts_found,
        "expected_amount": expected_amount,
        "transaction_id": parsed_info["transaction_id"],
        "detailed_analysis": parsed_info
    }
