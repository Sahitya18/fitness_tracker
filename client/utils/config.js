// Centralized configuration for API endpoints
// Change this IP address when your server IP changes
const API_CONFIG = {
  BASE_URL: 'http://192.168.1.7:8080/api',
  TIMEOUT: 5000, // 5 seconds
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      FORGOT_PASSWORD: '/auth/forgot-password',
      SEND_EMAIL_OTP: '/auth/send-email-otp',
      SEND_MOBILE_OTP: '/auth/send-mobile-otp'
    },
    REGISTRATION: {
      SEND_EMAIL_OTP: '/registration/send-email-otp',
      VERIFY_OTP: '/registration/verify-otp',
      REGISTER: '/registration/register',
      COMPLETE_PROFILE: '/registration/complete-profile'
    },
    STREAKS: {
      GET_USER_STREAK: '/streaks/user',
      RECORD_ACTIVITY: '/streaks/record'
    }
  }
};

export default API_CONFIG; 