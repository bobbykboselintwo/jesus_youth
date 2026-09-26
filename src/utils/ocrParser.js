import Tesseract from 'tesseract.js';

export function parseOcrText(rawText, expectedAmount = 100) {
  const textLower = rawText.toLowerCase();
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Detect App
  let appDetected = 'UPI App';
  if (textLower.includes('google pay') || textLower.includes('gpay')) appDetected = 'Google Pay (GPay)';
  else if (textLower.includes('phonepe')) appDetected = 'PhonePe';
  else if (textLower.includes('paytm')) appDetected = 'Paytm';
  else if (textLower.includes('bhim')) appDetected = 'BHIM UPI';
  else if (textLower.includes('amazon pay')) appDetected = 'Amazon Pay';

  // 2. Is UPI Payment?
  const isUpi = textLower.includes('upi') || textLower.includes('paid to') || textLower.includes('banking name') || textLower.includes('₹') || textLower.includes('rs');

  // 3. Payment Status
  let paymentStatus = 'UNSPECIFIED';
  if (textLower.includes('paid') || textLower.includes('successful') || textLower.includes('✓') || textLower.includes('completed')) {
    paymentStatus = 'SUCCESSFUL / PAID';
  } else if (textLower.includes('failed') || textLower.includes('declined')) {
    paymentStatus = 'FAILED';
  } else if (textLower.includes('pending')) {
    paymentStatus = 'PENDING';
  }

  // 4. Amount Extraction (Prioritize ₹ symbol)
  const amountsFound = [];
  
  // Match currency pattern like ₹1, ₹100, ₹ 100, Rs 100, Rs. 1
  const currencyMatches = rawText.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d{1,2})?)/gi);
  if (currencyMatches) {
    for (const m of currencyMatches) {
      const numStr = m.replace(/[^\d.]/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num)) amountsFound.push(num);
    }
  }

  // If no currency symbol found, match standalone numbers
  if (amountsFound.length === 0) {
    const standaloneMatches = rawText.match(/\b\d+(?:\.\d{1,2})?\b/g);
    if (standaloneMatches) {
      for (const m of standaloneMatches) {
        const num = parseFloat(m);
        if (!isNaN(num) && num >= 1 && num <= 50000 && num !== 2026) {
          amountsFound.push(num);
        }
      }
    }
  }

  const primaryAmount = amountsFound.length > 0 ? amountsFound[0] : null;

  // 5. Recipient Name Extraction
  let recipientName = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes('paid to') || l.includes('transferred to') || l.includes('to:')) {
      const inline = lines[i].replace(/^(paid to|transferred to|to:?)\s*/i, '').trim();
      if (inline.length > 2 && !inline.toLowerCase().startsWith('banking')) {
        recipientName = inline;
        break;
      } else if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.length > 2 && !nextLine.toLowerCase().includes('banking name') && !nextLine.toLowerCase().includes('powered')) {
          recipientName = nextLine;
          break;
        }
      }
    }
  }

  if (!recipientName) {
    if (textLower.includes('abraham') || textLower.includes('joseph') || textLower.includes('thadathil')) {
      recipientName = 'ABRAHAM JOSEPH THADATHIL';
    }
  }

  // 6. Date & Time Extraction
  let dateTimeStr = null;
  const dateMatch = rawText.match(/\b(?:\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}(?:,\s*\d{1,2}:\d{2}\s*(?:am|pm)?)?|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}:\d{2}\s*(?:am|pm))\b/i);
  if (dateMatch) {
    dateTimeStr = dateMatch[0];
  }

  // 7. UTR / Transaction ID
  let transactionId = null;
  const utrMatch = rawText.match(/\b\d{12}\b/);
  if (utrMatch) {
    transactionId = utrMatch[0];
  }

  // Validation Check vs Expected Amount (e.g. ₹1 vs ₹100)
  const amountMatch = primaryAmount !== null && Math.abs(primaryAmount - expectedAmount) < 0.01;
  let validationStatus = 'MANUAL_REVIEW';
  let validationMessage = '';

  if (primaryAmount !== null && !amountMatch) {
    validationStatus = 'REJECTED';
    validationMessage = `❌ Payment Rejected: Amount paid is ₹${primaryAmount}, but required fee is ₹${expectedAmount}.`;
  } else if (amountMatch && (textLower.includes('abraham') || textLower.includes('thadathil'))) {
    validationStatus = 'APPROVED';
    validationMessage = `✅ Payment Verified: ₹${primaryAmount} paid to ABRAHAM JOSEPH THADATHIL.`;
  } else {
    validationStatus = 'MANUAL_REVIEW';
    validationMessage = `⚡ Screenshot queued for Admin verification.`;
  }

  return {
    is_upi_payment: isUpi,
    app_detected: appDetected,
    payment_status: paymentStatus,
    recipient_name: recipientName || 'ABRAHAM JOSEPH THADATHIL',
    amount: primaryAmount,
    amounts_found: amountsFound,
    date_time: dateTimeStr || 'Not Extracted',
    transaction_id: transactionId || 'Not Extracted',
    raw_text: rawText,
    validationStatus,
    validationMessage
  };
}

export async function processScreenshotWithTesseract(imageSource, expectedAmount = 100) {
  try {
    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: () => {}
    });
    const text = result?.data?.text || '';
    return parseOcrText(text, expectedAmount);
  } catch (err) {
    console.warn('Tesseract.js error:', err);
    return parseOcrText('', expectedAmount);
  }
}
