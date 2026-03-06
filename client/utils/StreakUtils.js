/**
 * streakUtils.js
 * Shared streak logic — call `checkAndUpdateStreak()` on every app open/focus.
 * Returns the current streak count.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY        = 'userStreak';
const LAST_OPEN_KEY     = 'lastOpenDate';

/**
 * Returns today's date as YYYY-MM-DD in local time.
 */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Checks the stored last-open date against today and updates streak accordingly.
 * - Same day  → no change (already counted today)
 * - Yesterday → streak + 1
 * - Older     → reset to 1
 * Returns the updated streak number.
 */
export async function checkAndUpdateStreak() {
  try {
    const today        = todayStr();
    const storedDate   = await AsyncStorage.getItem(LAST_OPEN_KEY);
    const storedStreak = parseInt(await AsyncStorage.getItem(STREAK_KEY) || '0', 10);

    let newStreak = storedStreak;

    if (!storedDate) {
      // First ever open
      newStreak = 1;
    } else if (storedDate === today) {
      // Already opened today — keep streak as-is
      newStreak = storedStreak || 1;
    } else {
      // Check if yesterday
      const lastDate = new Date(storedDate + 'T00:00:00');
      const todayDate = new Date(today + 'T00:00:00');
      const diffDays  = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day → increment
        newStreak = storedStreak + 1;
      } else {
        // Missed one or more days → reset
        newStreak = 1;
      }
    }

    await AsyncStorage.setItem(STREAK_KEY,    String(newStreak));
    await AsyncStorage.setItem(LAST_OPEN_KEY, today);

    console.log(`🔥 Streak: ${newStreak} (last: ${storedDate}, today: ${today})`);
    return newStreak;
  } catch (e) {
    console.error('checkAndUpdateStreak error:', e);
    return 1;
  }
}

/**
 * Simply reads the current streak without modifying it.
 */
export async function getStreak() {
  try {
    const val = await AsyncStorage.getItem(STREAK_KEY);
    return parseInt(val || '1', 10);
  } catch {
    return 1;
  }
}
