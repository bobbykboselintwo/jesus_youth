#!/usr/bin/env bash
set -e

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Setting up Rootless Tesseract OCR for Linux ==="
mkdir -p tesseract_env
cd tesseract_env

if [ ! -f "usr/bin/tesseract" ]; then
  echo "Downloading Ubuntu Tesseract packages..."
  curl -sL http://archive.ubuntu.com/ubuntu/pool/main/t/tesseract/tesseract-ocr-eng_4.00~git30-7274c43-1.1_all.deb -o eng.deb || true
  curl -sL http://archive.ubuntu.com/ubuntu/pool/universe/t/tesseract/tesseract-ocr_4.1.1-2.1build1_amd64.deb -o tesseract.deb || true
  curl -sL http://archive.ubuntu.com/ubuntu/pool/universe/t/tesseract/libtesseract4_4.1.1-2.1build1_amd64.deb -o libtesseract.deb || true
  curl -sL http://archive.ubuntu.com/ubuntu/pool/main/l/lept/liblept5_1.82.0-1_amd64.deb -o liblept.deb || true

  for f in *.deb; do
    if [ -f "$f" ]; then
      ar x "$f" 2>/dev/null || true
      tar -xf data.tar.xz 2>/dev/null || tar -xf data.tar.gz 2>/dev/null || true
    fi
  done
fi

cd ..
echo "=== Build Complete ==="
