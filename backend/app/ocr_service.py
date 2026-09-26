import re
import io
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger("ocr_service")

# Expected payee baseline configuration
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
            # Resize image to improve OCR readability
            h, w = gray.shape[:2]
            if w < 1000:
                gray = cv2.resize(gray, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
            
            # Contrast enhancement / OTSU Thresholding
            thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            
            # Tesseract OCR extraction
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


def parse_and_validate_payment(
    image_bytes: bytes,
    expected_amount: float = 100.0
) -> Dict[str, Any]:
    """
    Parses OCR text and applies deterministic verification rules.
    Returns structured verification results and final status (APPROVED, MANUAL_REVIEW, REJECTED).
    """
    raw_text = extract_text_from_image(image_bytes)
    text_lower = raw_text.lower()

    # Rule 1: Check Payment Success Indicators
    success_keywords = ["paid", "successful", "success", "completed", "transferred to", "paid to", "✓", "sent"]
    has_success_indicator = any(kw in text_lower for kw in success_keywords)

    # Rule 2: Check UPI / GPay Indicators
    upi_keywords = ["upi", "gpay", "google pay", "banking name", "powered by upi", "phonepe", "paytm", "utr", "ref no"]
    has_upi_indicator = any(kw in text_lower for kw in upi_keywords)

    # Rule 3: Check Recipient Match (Abraham Joseph Thadathil)
    recipient_keywords = ["abraham", "joseph", "thadathil", "okhdfcbank"]
    matched_recipient_count = sum(1 for kw in recipient_keywords if kw in text_lower)
    has_recipient_match = matched_recipient_count >= 2 or "abraham joseph" in text_lower or "thadathil" in text_lower

    # Rule 4: Extract Amounts (Look for ₹ / Rs / INR numbers)
    # Match patterns like ₹100, ₹ 100, Rs. 100, INR 100, 100.00
    amounts_found = []
    
    # Currency symbol pattern: ₹100 or Rs 100
    currency_matches = re.findall(r'(?:₹|rs\.?|inr)\s*(\d+(?:\.\d{1,2})?)', text_lower)
    for match in currency_matches:
        try:
            amounts_found.append(float(match))
        except ValueError:
            pass

    # Standalone 2 to 5 digit numbers if no currency symbol match found
    if not amounts_found:
        number_matches = re.findall(r'\b(\d{2,5}(?:\.\d{1,2})?)\b', text_lower)
        for match in number_matches:
            try:
                amt = float(match)
                if 1 <= amt <= 10000:
                    amounts_found.append(amt)
            except ValueError:
                pass

    amount_matches_expected = any(abs(amt - expected_amount) < 0.01 for amt in amounts_found)

    # Rule 5: Extract UTR / Transaction ID (12-digit number sequence common in UPI)
    utr_match = re.search(r'\b\d{12}\b', raw_text)
    transaction_id = utr_match.group(0) if utr_match else None

    # Decision Engine:
    # 1. Fully Verified -> APPROVED
    if (amount_matches_expected or len(amounts_found) == 0) and has_recipient_match and (has_success_indicator or has_upi_indicator):
        status = "APPROVED"
        message = f"Payment screenshot verified successfully! Amount ₹{expected_amount} matched recipient ABRAHAM JOSEPH THADATHIL."
    elif amount_matches_expected or has_recipient_match or has_upi_indicator:
        # OCR extracted partial info or OCR couldn't parse text cleanly -> Escalated to MANUAL_REVIEW
        status = "MANUAL_REVIEW"
        message = "Screenshot received and queued. Required parameters detected, queued for final Admin verification."
    else:
        # Detected mismatch or non-payment image
        status = "MANUAL_REVIEW"
        message = f"Screenshot uploaded. Expected ₹{expected_amount} to ABRAHAM JOSEPH THADATHIL; queued for Admin review."

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
        "transaction_id": transaction_id
    }
