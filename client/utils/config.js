// Centralized configuration for API endpoints
// Change this IP address when your server IP changes
const API_CONFIG = {
  BASE_URL: 'http://192.168.1.14:8080/api',
  TIMEOUT: 10000, // 10 seconds
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
      REGISTER: 'http://192.168.1.14:8081/api/registration/register',
      COMPLETE_PROFILE: 'http://192.168.1.14:8081/api/registration/complete-profile'
    },
    STREAKS: {
      GET_USER_STREAK: '/streaks/user',
      RECORD_ACTIVITY: '/streaks/record'
    },
    MEALS: {
      MANUAL_MEALS: '/manual-meals',
      GET_MANUAL_MEALS: '/manual-meals',
      GET_MEALS: 'http://192.168.1.14:8083/api/meals/search'
    }
  }
};

export default API_CONFIG; 