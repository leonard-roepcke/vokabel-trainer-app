const STREAK_KEY = "vokabel-trainer-streak";

function loadStreakData() {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        streak: typeof parsed.streak === "number" && parsed.streak >= 0 ? parsed.streak : 0,
        lastCompletedDate:
          typeof parsed.lastCompletedDate === "string" ? parsed.lastCompletedDate : null,
      };
    }
  } catch {
    /* ignore */
  }
  return { streak: 0, lastCompletedDate: null };
}

let streakData = loadStreakData();

function saveStreakData() {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
}

export function getStreak() {
  return streakData.streak;
}

export function daysBetween(dateA, dateB) {
  const a = parseDateString(dateA);
  const b = parseDateString(dateB);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDaysToDateString(dateStr, days) {
  const base = parseDateString(dateStr);
  base.setHours(0, 0, 0, 0);
  const result = new Date(base.getTime() + days * 86_400_000);
  const year = result.getFullYear();
  const month = String(result.getMonth() + 1).padStart(2, "0");
  const day = String(result.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function wasDueOnDate(vocab, dateStr) {
  if (!vocab.nextReview) return true;
  return vocab.nextReview <= dateStr;
}

function hadDueVocabsOnDate(lists, dateStr) {
  return lists.some((list) => list.vocabs.some((vocab) => wasDueOnDate(vocab, dateStr)));
}

export function evaluateStreak(lists, todayDateString, countTotalDue) {
  const today = todayDateString;
  const yesterday = addDaysToDateString(today, -1);

  if (countTotalDue === 0) {
    if (streakData.lastCompletedDate === today) {
      return streakData.streak;
    }

    if (!streakData.lastCompletedDate) {
      streakData.streak = 1;
    } else {
      const gap = daysBetween(streakData.lastCompletedDate, today);
      if (gap === 1) {
        streakData.streak += 1;
      } else if (gap > 1) {
        let valid = true;
        for (let i = 1; i < gap; i++) {
          const checkDate = addDaysToDateString(streakData.lastCompletedDate, i);
          if (hadDueVocabsOnDate(lists, checkDate)) {
            valid = false;
            break;
          }
        }
        streakData.streak = valid ? streakData.streak + gap : 1;
      }
    }

    streakData.lastCompletedDate = today;
    saveStreakData();
    return streakData.streak;
  }

  if (
    streakData.lastCompletedDate &&
    streakData.lastCompletedDate < yesterday &&
    hadDueVocabsOnDate(lists, yesterday)
  ) {
    streakData.streak = 0;
    saveStreakData();
  }

  return streakData.streak;
}
