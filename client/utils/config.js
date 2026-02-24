// Centralized configuration for API endpoints
// Change this IP address when your server IP changes
const API_CONFIG = {
  BASE_URL: 'http://192.168.1.11:8080/api',
  BASE_URL_LOCALHOST: 'http://localhost:',
  TIMEOUT: 10000, // 10 seconds
  ENDPOINTS: {
    AUTH: {
      PORT:'8080',
      LOGIN: '/api/auth/login',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      SEND_EMAIL_OTP: '/api/auth/send-email-otp',
      SEND_MOBILE_OTP: '/api/auth/send-mobile-otp'
    },
    REGISTRATION: {
      PORT:'8081',
      SEND_EMAIL_OTP: '/api/registration/send-email-otp',
      VERIFY_OTP: '/api/registration/verify-otp',
      REGISTER: '/api/registration/register',
      CREATE_PROFILE: '/api/user/create-profile',
      UPDATE_PROFILE: '/api/user/update-profile',
      GET_PROFILE: '/api/user/profile'
    },
    STREAKS: {  
      GET_USER_STREAK: '/streaks/user',
      RECORD_ACTIVITY: '/streaks/record'
    },
    MEALS: {
      PORT: '8083',
      MANUAL_MEALS: '/api/meals/manual-meals',
      GET_MEALS: '/api/meals/search',
      UPDATE_MEAL:'/api/meals/update-meals'
    }
  }
};

export default API_CONFIG; 