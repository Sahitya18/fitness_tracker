// import ProxyClient from './ProxyClient';

// /**
//  * FitnessApiService - Secure wrapper for fitness API calls
//  * All API keys are handled server-side through the proxy
//  */
// class FitnessApiService {
    
//     /**
//      * Get user profile from fitness API
//      * @param {string} userId - User ID
//      * @returns {Promise<Object>} User profile data
//      */
//     async getUserProfile(userId) {
//         try {
//             return await ProxyClient.get('fitness-api', 'users/profile', {
//                 userId: userId
//             });
//         } catch (error) {
//             console.error('Failed to get user profile:', error);
//             throw error;
//         }
//     }

//     /**
//      * Log a workout session
//      * @param {Object} workoutData - Workout information
//      * @param {string} workoutData.type - Type of workout (cardio, strength, etc.)
//      * @param {number} workoutData.duration - Duration in minutes
//      * @param {number} workoutData.calories - Calories burned
//      * @param {string} workoutData.userId - User ID
//      * @returns {Promise<Object>} Workout log result
//      */
//     async logWorkout(workoutData) {
//         try {
//             return await ProxyClient.post('fitness-api', 'workouts', {
//                 type: workoutData.type,
//                 duration: workoutData.duration,
//                 calories: workoutData.calories,
//                 userId: workoutData.userId,
//                 timestamp: new Date().toISOString()
//             });
//         } catch (error) {
//             console.error('Failed to log workout:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get workout history
//      * @param {string} userId - User ID
//      * @param {Object} filters - Optional filters
//      * @param {string} filters.startDate - Start date (ISO string)
//      * @param {string} filters.endDate - End date (ISO string)
//      * @param {string} filters.type - Workout type filter
//      * @returns {Promise<Array>} Workout history
//      */
//     async getWorkoutHistory(userId, filters = {}) {
//         try {
//             const queryParams = {
//                 userId: userId,
//                 ...filters
//             };
            
//             return await ProxyClient.get('fitness-api', 'workouts/history', queryParams);
//         } catch (error) {
//             console.error('Failed to get workout history:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get nutrition data
//      * @param {string} userId - User ID
//      * @param {string} date - Date in YYYY-MM-DD format
//      * @returns {Promise<Object>} Nutrition data
//      */
//     async getNutritionData(userId, date) {
//         try {
//             return await ProxyClient.get('fitness-api', 'nutrition/daily', {
//                 userId: userId,
//                 date: date
//             });
//         } catch (error) {
//             console.error('Failed to get nutrition data:', error);
//             throw error;
//         }
//     }

//     /**
//      * Log nutrition entry
//      * @param {Object} nutritionData - Nutrition information
//      * @param {string} nutritionData.userId - User ID
//      * @param {string} nutritionData.mealType - Type of meal (breakfast, lunch, dinner, snack)
//      * @param {Array} nutritionData.items - Array of food items
//      * @returns {Promise<Object>} Nutrition log result
//      */
//     async logNutrition(nutritionData) {
//         try {
//             return await ProxyClient.post('fitness-api', 'nutrition/log', {
//                 userId: nutritionData.userId,
//                 mealType: nutritionData.mealType,
//                 items: nutritionData.items,
//                 timestamp: new Date().toISOString()
//             });
//         } catch (error) {
//             console.error('Failed to log nutrition:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get fitness goals
//      * @param {string} userId - User ID
//      * @returns {Promise<Object>} User's fitness goals
//      */
//     async getFitnessGoals(userId) {
//         try {
//             return await ProxyClient.get('fitness-api', 'goals', {
//                 userId: userId
//             });
//         } catch (error) {
//             console.error('Failed to get fitness goals:', error);
//             throw error;
//         }
//     }

//     /**
//      * Update fitness goals
//      * @param {string} userId - User ID
//      * @param {Object} goals - Updated goals
//      * @returns {Promise<Object>} Updated goals
//      */
//     async updateFitnessGoals(userId, goals) {
//         try {
//             return await ProxyClient.put('fitness-api', 'goals', {
//                 userId: userId,
//                 goals: goals
//             });
//         } catch (error) {
//             console.error('Failed to update fitness goals:', error);
//             throw error;
//         }
//     }

//     /**
//      * Get fitness analytics
//      * @param {string} userId - User ID
//      * @param {Object} params - Analytics parameters
//      * @param {string} params.period - Time period (week, month, year)
//      * @param {string} params.metric - Metric type (calories, workouts, etc.)
//      * @returns {Promise<Object>} Analytics data
//      */
//     async getAnalytics(userId, params = {}) {
//         try {
//             return await ProxyClient.get('fitness-api', 'analytics', {
//                 userId: userId,
//                 period: params.period || 'week',
//                 metric: params.metric || 'overview'
//             });
//         } catch (error) {
//             console.error('Failed to get analytics:', error);
//             throw error;
//         }
//     }

//     /**
//      * Check proxy health
//      * @returns {Promise<boolean>} Health status
//      */
//     async checkHealth() {
//         try {
//             return await ProxyClient.healthCheck();
//         } catch (error) {
//             console.error('Proxy health check failed:', error);
//             return false;
//         }
//     }
// }

// // Export singleton instance
// export default new FitnessApiService();
