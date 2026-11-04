// storage.js is used by BOTH pages.
// It saves goals in the browser with localStorage, so they are still
// there after you close the page or come back next week.

// Comment 1. All goals are saved under one name (a "key").
const STORAGE_KEY = "dailyGoals";

// Comment 2. The saved data is ONE object. Each date points to that day's goals:
// {
//     "2026-11-04": [
//         { id: 1730700000000, text: "Read 10 pages", done: true, removed: false },
//         { id: 1730700005000, text: "Go for a run", done: false, removed: false }
//     ],
//     "2026-11-05": [ ... ]
// }

// Comment 3. Read all goals from the browser.
// localStorage can only store text, so JSON.parse turns the text back into an object.
function loadAllGoals() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
        return {}; // Nothing saved yet
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        return {}; // Saved text was broken, start fresh
    }
}

// Comment 4. Save all goals. JSON.stringify turns the object into text.
function saveAllGoals(allGoals) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allGoals));
}

// Comment 5. Turn a date into text like "2026-11-04".
// padStart adds a 0 in front of single digits: 4 -> "04".
// (We don't use toISOString() because it uses London time, not your time,
// and could put tonight's goals on tomorrow's date.)
function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() starts at 0
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
