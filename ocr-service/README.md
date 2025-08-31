# Simple OCR Service

A lightweight OCR service that extracts all text from images using Google Cloud Vision API.

## Features

- **Simple Text Extraction**: Extracts all text from images without parsing
- **Google Cloud Vision**: High-accuracy OCR using Google's Vision API
- **File Logging**: Comprehensive logs saved to `logs/simple_ocr_service.log`
- **Log Rotation**: Automatic log rotation (10MB max, 5 backup files)
- **CORS Support**: Cross-origin requests enabled
- **Health Checks**: Built-in health and test endpoints

## Setup

1. **Install Dependencies**:
   ```bash
   pip install flask flask-cors google-cloud-vision pillow werkzeug
   ```

2. **Google Cloud Credentials**:
   - Place your Google Cloud Vision JSON credentials file at: `D:/projects/text-recognition1-470608-b972c314b0fd.json`
   - Or set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

3. **Run the Service**:
   ```bash
   python simple_ocr_service.py
   ```

## Endpoints

- `GET /` - Service information
- `GET /health` - Health check
- `GET /ping` - Simple connectivity test
- `GET /test` - Test endpoint
- `POST /extract-text` - Extract text from image

## Logging

The service maintains detailed logs in `logs/simple_ocr_service.log`:

- **Request Logging**: All incoming requests are logged with details
- **OCR Processing**: Text extraction steps and results
- **Error Handling**: Detailed error messages and stack traces
- **Service Events**: Startup, shutdown, and configuration events

### Log Format
```
2025-08-31 12:43:57,815 - simple_ocr_service - INFO - extract_text:150 - Text extraction successful. Length: 123 characters
```

### Log Rotation
- Maximum file size: 10MB
- Backup files: 5 (simple_ocr_service.log.1, .2, etc.)
- Automatic rotation when size limit is reached

## Usage

Send a POST request to `/extract-text` with an image file:

```bash
curl -X POST -F "image=@your_image.jpg" http://localhost:8086/extract-text
```

Response:
```json
{
  "success": true,
  "message": "Text extracted successfully",
  "text": "Extracted text content...",
  "text_length": 123
}
```

## Configuration

- **Host**: 0.0.0.0 (all interfaces)
- **Port**: 8086
- **Max File Size**: 16MB
- **Allowed Formats**: PNG, JPG, JPEG, GIF, BMP
- **Log Level**: INFO (console), DEBUG (file)
