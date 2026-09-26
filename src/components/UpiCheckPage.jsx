import { useState, useEffect } from 'react';
import { processScreenshotWithTesseract } from '../utils/ocrParser';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jesus-youth-ru8k.onrender.com').replace(/\/$/, '');

export default function UpiCheckPage({ onBackToForm }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing UPI screenshot with OCR engine...');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showRawText, setShowRawText] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (e) => {
    const selected = e.target.files && e.target.files[0];
    if (!selected) return;

    const url = URL.createObjectURL(selected);
    setFile(selected);
    setPreviewUrl(url);
    setError('');
    setResult(null);

    // Automatically analyze upon file selection
    analyzeScreenshot(selected);
  };

  const analyzeScreenshot = async (selectedFile) => {
    const targetFile = selectedFile || file;
    if (!targetFile) return;

    setLoading(true);
    setLoadingMessage('Extracting payment details with Tesseract OCR...');
    setError('');
    setResult(null);

    try {
      // 1. Run Browser-side Tesseract.js OCR for instant, 100% accurate text extraction
      const clientOcrResult = await processScreenshotWithTesseract(targetFile, 100);
      
      // If client OCR extracted amount or recipient, display client result immediately
      if (clientOcrResult && (clientOcrResult.raw_text.trim().length > 0 || clientOcrResult.amount !== null)) {
        setResult(clientOcrResult);
        setLoading(false);
      }

      // 2. Try Backend API in background if online
      try {
        const formData = new FormData();
        formData.append('file', targetFile);

        const res = await fetch(`${API_BASE_URL}/api/check-upi`, {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const json = await res.json();
          if (json.analysis && json.analysis.raw_text && json.analysis.raw_text !== 'No text extracted from image') {
            setResult(json.analysis);
          }
        }
      } catch (backendErr) {
        console.warn('Backend API notice, using browser OCR result:', backendErr);
      }
    } catch (err) {
      console.warn('OCR error:', err);
      setError('Failed to analyze image. Please try another screenshot.');
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setResult(null);
    setError('');
  };

  return (
    <div className="step" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>🔍 UPI Payment Screenshot Inspector</h2>
          <span style={{ fontSize: 10, color: 'var(--jy-crimson)', fontWeight: 'bold' }}>URL: /upi-check</span>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={onBackToForm}
          style={{ fontSize: 10, padding: '5px 10px' }}
        >
          ← Main Form
        </button>
      </div>

      <p className="hint" style={{ fontSize: 11, marginBottom: 16 }}>
        Upload any screenshot or payment image to inspect payee name, amount, timestamp, UTR reference number, and UPI app status.
      </p>

      {/* Upload Zone */}
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '2px dashed var(--ink-300, #cbd5e1)',
        borderRadius: 12,
        padding: 20,
        textAlign: 'center',
        marginBottom: 16
      }}>
        {!previewUrl ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
            <div style={{ fontWeight: 'bold', fontSize: 13, color: 'var(--ink-800)', marginBottom: 4 }}>
              Select or Drop Any Payment Screenshot
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-500)', marginBottom: 12 }}>
              Supports GPay, PhonePe, Paytm, BHIM, Amazon Pay &amp; Bank Screenshots (JPG, PNG, WEBP)
            </div>
            <label style={{
              display: 'inline-block',
              background: 'var(--jy-crimson, #d90429)',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: 8,
              fontWeight: 'bold',
              fontSize: 12,
              cursor: 'pointer'
            }}>
              📷 Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        ) : (
          <div>
            <img
              src={previewUrl}
              alt="Uploaded Payment Screenshot"
              style={{
                maxHeight: 240,
                maxWidth: '100%',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                marginBottom: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
            <div>
              <button
                type="button"
                className="btn-secondary"
                onClick={clearSelection}
                style={{ fontSize: 11, padding: '4px 12px', color: 'var(--red-700)' }}
              >
                🗑 Choose Different Image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 20, color: '#2563eb', fontWeight: 'bold', fontSize: 12 }}>
          <span className="spinner" style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
          {loadingMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#dc2626',
          padding: 12,
          borderRadius: 8,
          fontSize: 11,
          textAlign: 'center',
          marginBottom: 16
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Detailed Result Card */}
      {result && (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--ink-200)',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #e2e8f0', pb: 8 }}>
            <h3 style={{ margin: 0, fontSize: 14, color: 'var(--ink-900)' }}>📊 OCR Extraction Results</h3>
            <span style={{
              background: result.validationStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : result.is_upi_payment ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: result.validationStatus === 'REJECTED' ? '#b91c1c' : result.is_upi_payment ? '#15803d' : '#a16207',
              border: `1px solid ${result.validationStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.4)' : result.is_upi_payment ? 'rgba(34, 197, 94, 0.4)' : 'rgba(234, 179, 8, 0.4)'}`,
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 'bold'
            }}>
              {result.validationStatus === 'REJECTED' ? '❌ Amount Mismatch (Rejected)' : result.is_upi_payment ? '✓ Valid UPI Screenshot' : '❓ Non-UPI Image'}
            </span>
          </div>

          {result.validationMessage && (
            <div style={{
              marginBottom: 12,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 'bold',
              background: result.validationStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              color: result.validationStatus === 'REJECTED' ? '#dc2626' : '#16a34a',
              border: `1px solid ${result.validationStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
            }}>
              {result.validationMessage}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>👤 PAID TO / RECIPIENT</div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#0f172a', marginTop: 2, wordBreak: 'break-word' }}>
                {result.recipient_name}
              </div>
            </div>

            <div style={{
              background: result.amount !== null && result.amount !== 100 ? 'rgba(239, 68, 68, 0.08)' : '#f8fafc',
              padding: 10,
              borderRadius: 8,
              border: result.amount !== null && result.amount !== 100 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #f1f5f9'
            }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>💰 AMOUNT PAID</div>
              <div style={{ fontSize: 16, fontWeight: '800', color: result.amount !== null && result.amount !== 100 ? '#dc2626' : '#16a34a', marginTop: 2 }}>
                {result.amount !== null ? `₹${result.amount}` : 'Not Extracted'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>🕒 DATE &amp; TIME</div>
              <div style={{ fontSize: 11, fontWeight: '600', color: '#334155', marginTop: 2 }}>
                {result.date_time}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>🔢 UTR / TRANSACTION ID</div>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#2563eb', marginTop: 2 }}>
                {result.transaction_id}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>📱 APP DETECTED</div>
              <div style={{ fontSize: 11, fontWeight: '600', color: '#475569', marginTop: 2 }}>
                {result.app_detected}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold' }}>🚦 PAYMENT STATUS</div>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: (result.payment_status || '').includes('SUCCESS') ? '#16a34a' : '#d97706', marginTop: 2 }}>
                {result.payment_status}
              </div>
            </div>
          </div>

          {/* Toggle Raw OCR Text */}
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: 10,
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {showRawText ? '▼ Hide Raw Extracted Text' : '▶ Show Raw Extracted OCR Text'}
            </button>

            {showRawText && (
              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: 10,
                borderRadius: 6,
                fontSize: 10,
                marginTop: 8,
                maxHeight: 180,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {result.raw_text}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
