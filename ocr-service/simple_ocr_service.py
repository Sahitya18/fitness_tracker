#!/usr/bin/env python3
"""
Simple OCR Service - Google Cloud Vision
=======================================

A simple OCR service that extracts all text from images using Google Cloud Vision API.
No nutritional parsing, just pure text extraction.

Usage:
    python simple_ocr_service.py
"""

import os
import io
import re
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import vision
from PIL import Image
from werkzeug.utils import secure_filename

# Configure logging
import logging.config

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

# Logging configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'detailed': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        },
        'simple': {
            'format': '%(asctime)s - %(levelname)s - %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'detailed',
            'stream': 'ext://sys.stdout'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'DEBUG',
            'formatter': 'detailed',
            'filename': 'logs/simple_ocr_service.log',
            'maxBytes': 10 * 1024 * 1024,  # 10MB
            'backupCount': 5,
            'mode': 'a'
        }
    },
    'loggers': {
        '': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False
        }
    }
}

# Apply logging configuration
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)

# Log service startup
logger.info("="*80)
logger.info("SIMPLE OCR SERVICE LOGGING INITIALIZED")
logger.info("="*80)

# Flask app setup
app = Flask(__name__)
CORS(app)

# Add request logging middleware
@app.before_request
def log_request():
    """Log all incoming requests"""
    logger.info("="*80)
    logger.info("INCOMING REQUEST DETECTED")
    logger.info("="*80)
    logger.info(f"Timestamp: {__import__('datetime').datetime.now()}")
    logger.info(f"Remote Address: {request.remote_addr}")
    logger.info(f"Method: {request.method}")
    logger.info(f"URL: {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"Files: {list(request.files.keys()) if request.files else 'No files'}")
    logger.info(f"Form Data: {dict(request.form) if request.form else 'No form data'}")
    logger.info("="*80)

# Configuration
HOST = '0.0.0.0'
PORT = 8086
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Google Cloud Vision credentials
# Force set the correct credentials path regardless of environment variable
GOOGLE_CREDENTIALS_PATH = 'D:/projects/text-recognition1-470608-b972c314b0fd.json'
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = GOOGLE_CREDENTIALS_PATH

# Verify credentials file is valid JSON
try:
    import json
    with open(GOOGLE_CREDENTIALS_PATH, 'r') as f:
        creds_data = json.load(f)
        logger.info(f"Credentials file is valid JSON. Project ID: {creds_data.get('project_id', 'Not found')}")
except Exception as e:
    logger.error(f"Invalid credentials file: {e}")
    raise Exception(f"Invalid Google Cloud credentials file: {e}")

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Log credentials configuration
logger.info(f"Google Cloud credentials path: {GOOGLE_CREDENTIALS_PATH}")
if os.path.exists(GOOGLE_CREDENTIALS_PATH):
    logger.info("Google Cloud credentials file found")
else:
    logger.warning(f"Google Cloud credentials file not found: {GOOGLE_CREDENTIALS_PATH}")

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_nutritional_data(raw_text):
    """Parse raw text to extract structured nutritional data"""
    try:
        logger.info("Parsing nutritional data from raw text...")
        logger.info(f"Raw text length: {len(raw_text)} characters")
        
        # Convert to lowercase for easier matching
        text_lower = raw_text.lower()
        
        # Initialize nutritional data structure
        nutritional_data = {
            'serving_size': None,
            'energy': None,
            'protein': None,
            'carbohydrates': None,
            'fiber': None,
            'total_fat': None,
            'raw_text': raw_text
        }
        
        # Parse serving size
        serving_patterns = [
            r'serving size[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams|ml|milliliter|milliliters)',
            r'per serving[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams|ml|milliliter|milliliters)',
            r'([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams|ml|milliliter|milliliters)\s*per serving'
        ]
        
        for pattern in serving_patterns:
            match = re.search(pattern, text_lower)
            if match:
                nutritional_data['serving_size'] = {
                    'value': float(match.group(1)),
                    'unit': match.group(2)
                }
                logger.info(f"Found serving size: {match.group(1)} {match.group(2)}")
                break
        
        # Parse energy/calories
        energy_patterns = [
            r'energy[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(kcal|calories|cal)',
            r'calories[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(kcal|calories|cal)',
            r'([0-9]+(?:\.[0-9]+)?)\s*(kcal|calories|cal)'
        ]
        
        for pattern in energy_patterns:
            match = re.search(pattern, text_lower)
            if match:
                nutritional_data['energy'] = {
                    'value': float(match.group(1)),
                    'unit': match.group(2)
                }
                logger.info(f"Found energy: {match.group(1)} {match.group(2)}")
                break
        
        # Parse protein
        protein_patterns = [
            r'protein[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)',
            r'([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)\s*protein'
        ]
        
        for pattern in protein_patterns:
            match = re.search(pattern, text_lower)
            if match:
                nutritional_data['protein'] = {
                    'value': float(match.group(1)),
                    'unit': match.group(2)
                }
                logger.info(f"Found protein: {match.group(1)} {match.group(2)}")
                break
        
        # Parse carbohydrates
        carb_patterns = [
            r'carbohydrates?[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)',
            r'carbs?[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)',
            r'([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)\s*carbohydrates?',
            r'([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)\s*carbs?'
        ]
        
        for pattern in carb_patterns:
            match = re.search(pattern, text_lower)
            if match:
                nutritional_data['carbohydrates'] = {
                    'value': float(match.group(1)),
                    'unit': match.group(2)
                }
                logger.info(f"Found carbohydrates: {match.group(1)} {match.group(2)}")
                break
        
        # Parse fiber
        fiber_patterns = [
            r'fiber[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)',
            r'dietary fiber[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)',
            r'([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)\s*fiber',
            r'([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)\s*dietary fiber'
        ]
        
        for pattern in fiber_patterns:
            match = re.search(pattern, text_lower)
            if match:
                nutritional_data['fiber'] = {
                    'value': float(match.group(1)),
                    'unit': match.group(2)
                }
                logger.info(f"Found fiber: {match.group(1)} {match.group(2)}")
                break
        
        # Parse total fat
        fat_patterns = [
            r'total fat[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)',
            r'fat[:\s]*([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)',
            r'([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)\s*total fat',
            r'([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)\s*fat'
        ]
        
        for pattern in fat_patterns:
            match = re.search(pattern, text_lower)
            if match:
                nutritional_data['total_fat'] = {
                    'value': float(match.group(1)),
                    'unit': match.group(2)
                }
                logger.info(f"Found total fat: {match.group(1)} {match.group(2)}")
                break
        
        # Count how many values were found
        found_values = sum(1 for value in nutritional_data.values() if value is not None and value != raw_text)
        logger.info(f"Parsed {found_values} nutritional values from text")
        
        return nutritional_data
        
    except Exception as e:
        logger.error(f"Error parsing nutritional data: {e}")
        return {
            'serving_size': None,
            'energy': None,
            'protein': None,
            'carbohydrates': None,
            'fiber': None,
            'total_fat': None,
            'raw_text': raw_text,
            'error': str(e)
        }

def extract_text_from_image(image_path):
    """Extracts all text from an image using Google Vision API"""
    try:
        logger.info("Starting text extraction process...")
        logger.info(f"Image path: {image_path}")
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Google credentials path: {os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')}")
        
        # Check if credentials file exists
        creds_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        if creds_path and os.path.exists(creds_path):
            logger.info(f"Credentials file exists: {creds_path}")
            logger.info(f"Credentials file size: {os.path.getsize(creds_path)} bytes")
        else:
            logger.error(f"Credentials file not found or invalid: {creds_path}")
            raise Exception(f"Google Cloud credentials file not found: {creds_path}")
        
        # Initialize Google Vision client
        logger.info("Initializing Google Vision client...")
        client = vision.ImageAnnotatorClient()
        logger.info("Google Vision client initialized successfully")
        
        # Load image file
        with io.open(image_path, "rb") as image_file:
            content = image_file.read()
        logger.info("Image file loaded successfully")
        
        # Create image object
        image = vision.Image(content=content)
        
        # Detect text
        logger.info("Sending request to Google Cloud Vision API...")
        response = client.text_detection(image=image)
        texts = response.text_annotations
        
        # Check for API errors
        if response.error.message:
            logger.error(f"Google Vision API error: {response.error.message}")
            raise Exception(response.error.message)
        
        # Extract text
        if texts:
            # First element contains all text
            full_text = texts[0].description
            logger.info(f"Text extraction successful. Length: {len(full_text)} characters")
            
            # Parse the raw text into structured nutritional data
            nutritional_data = parse_nutritional_data(full_text)
            
            return {
                'raw_text': full_text,
                'structured_data': nutritional_data
            }
        else:
            logger.warning("No text detected in image")
            return {
                'raw_text': "",
                'structured_data': {
                    'serving_size': None,
                    'energy': None,
                    'protein': None,
                    'carbohydrates': None,
                    'fiber': None,
                    'total_fat': None,
                    'raw_text': "",
                    'error': 'No text detected in image'
                }
            }
            
    except Exception as e:
        logger.error(f"Text extraction failed: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Simple OCR Service is running',
        'service': 'Google Cloud Vision OCR',
        'endpoints': {
            'health': '/health',
            'extract_text': '/extract-text',
            'test': '/test'
        }
    })

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint"""
    logger.info("TEST ENDPOINT CALLED")
    
    # Test Google Cloud Vision client initialization
    try:
        logger.info("Testing Google Cloud Vision client initialization...")
        client = vision.ImageAnnotatorClient()
        logger.info("Google Cloud Vision client test successful")
        
        return jsonify({
            'message': 'Simple OCR Service is working!',
            'status': 'connected',
            'google_vision': 'client_initialized_successfully',
            'features': [
                'Google Cloud Vision text extraction',
                'Simple text output (no parsing)',
                'Support for multiple image formats'
            ]
        })
    except Exception as e:
        logger.error(f"Google Cloud Vision client test failed: {e}")
        return jsonify({
            'message': 'Simple OCR Service is working but Google Vision client failed',
            'status': 'connected',
            'google_vision': 'client_initialization_failed',
            'error': str(e),
            'features': [
                'Service is running',
                'Google Cloud Vision client needs fixing'
            ]
        }), 500

@app.route('/ping', methods=['GET'])
def ping():
    """Simple ping endpoint for testing connectivity"""
    logger.info("PING ENDPOINT CALLED")
    return jsonify({
        'message': 'pong',
        'timestamp': str(__import__('datetime').datetime.now()),
        'service': 'Simple OCR Service'
    })

@app.route('/extract-text', methods=['POST'])
def extract_text():
    """Extract all text from uploaded image"""
    logger.info("=== TEXT EXTRACTION REQUEST STARTED ===")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {dict(request.headers)}")
    logger.info(f"Request files keys: {list(request.files.keys()) if request.files else 'No files'}")
    
    try:
        # Check if image file is provided
        if 'image' not in request.files:
            logger.error("No 'image' key found in request.files")
            logger.info(f"Available keys in request.files: {list(request.files.keys())}")
            return jsonify({
                'success': False,
                'error': 'No image file provided',
                'message': 'Please provide an image file in the request'
            }), 400
        
        file = request.files['image']
        logger.info(f"======================File exists: {file.filename}====================================")
        logger.info(f"File content type: {file.content_type}")
        logger.info(f"File stream: {file.stream}")
        
        # Validate file
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected',
                'message': 'Please select a file'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Invalid file type',
                'message': f'Allowed file types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        logger.info(f"======================File size: {file_size} bytes====================================")
        
        if file_size > MAX_FILE_SIZE:
            logger.error(f"File too large: {file_size} bytes (max: {MAX_FILE_SIZE} bytes)")
            return jsonify({
                'success': False,
                'error': 'File too large',
                'message': f'Maximum file size: {MAX_FILE_SIZE // (1024*1024)}MB'
            }), 400
        
        logger.info(f"Processing file: {file.filename} ({file_size} bytes)")
        
        # Save uploaded image
        filename = secure_filename(file.filename)
        image_path = os.path.join(UPLOAD_FOLDER, f'temp_{filename}')
        
        logger.info(f"======================Saving image to: {image_path}====================================")
        
        # Save image
        try:
            image = Image.open(file.stream).convert('RGB')
            image.save(image_path)
            logger.info(f"======================Image saved successfully: {image_path}====================================")
            logger.info(f"Image dimensions: {image.size}")
        except Exception as save_error:
            logger.error(f"Failed to save image: {save_error}")
            raise
        
        # Extract text
        logger.info(f"======================Starting text extraction from: {image_path}====================================")
        extraction_result = extract_text_from_image(image_path)
        logger.info(f"======================Text extraction completed====================================")
        
        # Clean up temporary file
        try:
            os.remove(image_path)
            logger.info("Temporary file cleaned up")
        except Exception as cleanup_error:
            logger.warning(f"Failed to cleanup temp file: {cleanup_error}")
        
        # Return response
        if extraction_result['raw_text'].strip():
            logger.info("=== TEXT EXTRACTION COMPLETED SUCCESSFULLY ===")
            logger.info(f"Raw text preview: {extraction_result['raw_text'][:100]}...")
            logger.info(f"Structured data: {extraction_result['structured_data']}")
            
            return jsonify({
                'success': True,
                'message': 'Text extracted and parsed successfully',
                'raw_text': extraction_result['raw_text'],
                'text_length': len(extraction_result['raw_text']),
                'nutritional_data': extraction_result['structured_data']
            })
        else:
            logger.warning("No text found in image")
            return jsonify({
                'success': False,
                'error': 'No text found',
                'message': 'No readable text was found in the image'
            }), 400
            
    except Exception as e:
        logger.error(f"=== TEXT EXTRACTION FAILED ===")
        logger.error(f"Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Text extraction failed',
            'message': f'Failed to extract text: {str(e)}'
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with service information"""
    return jsonify({
        'service': 'Simple OCR Service',
        'version': '1.0.0',
        'description': 'Extract all text from images using Google Cloud Vision API',
        'endpoints': {
            'health': '/health',
            'extract_text': '/extract-text',
            'test': '/test'
        },
        'status': 'running'
    })

if __name__ == '__main__':
    print("="*80)
    print("SIMPLE OCR SERVICE STARTING")
    print("="*80)
    print(f"Service: Simple OCR Service")
    print(f"Version: 1.0.0")
    print(f"Focus: Extract ALL text from images")
    print(f"Host: {HOST}")
    print(f"Port: {PORT}")
    print("="*80)
    print("\nAvailable Endpoints:")
    print("   • GET  /           - Service information")
    print("   • GET  /health     - Health check")
    print("   • POST /extract-text - Extract text from image")
    print("   • GET  /test       - Test endpoint")
    print("="*80)
    print(f"\nService will be available at:")
    print(f"   • Local: http://localhost:{PORT}")
    print(f"   • Network: http://{HOST}:{PORT}")
    print("="*80)
    print("\nDEBUG MODE: All requests will be logged")
    print("Check console for detailed request logs")
    print("="*80)
    print("\nStarting service...\n")
    
    logger.info("Simple OCR Service starting up...")
    logger.info(f"Listening on {HOST}:{PORT}")
    logger.info("Request logging enabled - all incoming requests will be logged")
    logger.info("File logging enabled - logs saved to logs/simple_ocr_service.log")
    
    app.run(host=HOST, port=PORT, debug=True, threaded=True)
