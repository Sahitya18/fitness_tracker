// OCR Service Configuration
// Update these values based on your network setup

const getBaseUrl = () => {
  // Always use the computer's IP address for mobile testing
  // Replace with your computer's IP address when testing on mobile
  return 'http://192.168.1.14:8086'; // Your computer's IP address with port 8086 (Google Vision OCR)
};

const OCR_CONFIG = {
  // Base URL for the OCR service
  BASE_URL: getBaseUrl(),
  
  // Endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    EXTRACT_TEXT: '/extract-text',
    TEST: '/test'
  },
  
  // Timeout settings (in milliseconds)
  TIMEOUT: 30000,
  
  // File upload settings
  MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'],
  
  // OCR settings
  CONFIDENCE_THRESHOLD: 50, // Minimum confidence percentage
};

export default OCR_CONFIG;
