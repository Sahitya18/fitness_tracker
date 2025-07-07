import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.9:8080/api';

export const StreakService = {
    async getUserStreak() {
        try {
            const userData = await AsyncStorage.getItem('userData');
            console.log('Stored user data:', userData);
            
            if (!userData) {
                console.log('No user data found in storage');
                return { currentStreak: 0, longestStreak: 0 };
            }

            const user = JSON.parse(userData);
            console.log('Parsed user data:', user);
            
            if (!user.id) {
                console.log('No user ID found in stored data');
                return { currentStreak: 0, longestStreak: 0 };
            }

            const url = `${BASE_URL}/streaks/user/${user.id}`;
            console.log('Fetching streak from:', url);
            
            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`Failed to fetch streak: ${errorText}`);
            }

            const data = await response.json();
            console.log('Streak data received:', data);
            return data;
        } catch (error) {
            console.error('Detailed error in getUserStreak:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            return { currentStreak: 0, longestStreak: 0 };
        }
    },

    async recordActivity() {
        try {
            const userData = await AsyncStorage.getItem('userData');
            console.log('Recording activity for user data:', userData);
            
            if (!userData) {
                throw new Error('No user data found');
            }

            const user = JSON.parse(userData);
            if (!user.id) {
                throw new Error('No user ID found in stored data');
            }

            const url = `${BASE_URL}/streaks/record/${user.id}`;
            console.log('Recording activity at:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Record activity response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`Failed to record activity: ${errorText}`);
            }

            const data = await response.json();
            console.log('Activity recording response:', data);
            return data;
        } catch (error) {
            console.error('Detailed error in recordActivity:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }
}; 