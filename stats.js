// stats.js runs on stats.html.
// It reads the saved goals and shows numbers for one month.

// 1. Are we in demo mode? (the page address ends with ?demo=1)
const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";

// Use sample data in demo mode, real saved data otherwise
let allGoals;
if (isDemo) {
    allGoals = makeSampleData();
    document.getElementById("demo-note").hidden = false;
} else {
    allGoals = loadAllGoals();
}

// 2. Start on the current month. Day 1 of the month is enough.
const today = new Date();
let shownMonth = new Date(today.getFullYear(), today.getMonth(), 1);

// 3. Get HTML elements
const monthName = document.getElementById("month-name");
const prevButton = document.getElementById("prev-month");
const nextButton = document.getElementById("next-month");
const calendar = document.getElementById("calendar");
const topGoalsList = document.getElementById("top-goals");
const noDataText = document.getElementById("no-data");

// 4. Calculate and show everything for the shown month
function showMonth() {
    const year = shownMonth.getFullYear();
    const month = shownMonth.getMonth();

    monthName.textContent = shownMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Day 0 of NEXT month = the last day of THIS month. Handy trick!
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let totalGoals = 0;
    let totalDone = 0;
    let activeDays = 0;
    let perfectDays = 0;
    const goalCounts = {}; // How many times each goal was finished

    calendar.innerHTML = "";

    // Weekday names on top of the calendar
    ["S", "M", "T", "W", "T", "F", "S"].forEach(function(letter) {
        const head = document.createElement("div");
        head.className = "weekday";
        head.textContent = letter;
        calendar.appendChild(head);
    });

    // Empty boxes before day 1 (if the month starts on Wednesday, we need 3)
    const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
    for (let i = 0; i < firstWeekday; i++) {
        calendar.appendChild(document.createElement("div"));
    }

    // 5. Go through every day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const goals = allGoals[dateKey(date)] || []; // || [] means "or an empty list"

        const doneCount = goals.filter(function(goal) {
            return goal.done;
        }).length;

        totalGoals += goals.length;
        totalDone += doneCount;
        if (goals.length > 0) activeDays++;
        if (goals.length > 0 && doneCount === goals.length) perfectDays++;

        // Count finished goals by name. toLowerCase so "Run" and "run" are the same.
        goals.forEach(function(goal) {
            if (goal.done) {
                const name = goal.text.toLowerCase();
                goalCounts[name] = (goalCounts[name] || 0) + 1;
            }
        });

        // Make one calendar square
        const cell = document.createElement("div");
        cell.className = "day level-" + colorLevel(doneCount, goals.length);
        cell.textContent = day;
        cell.title = `${dateKey(date)}: ${doneCount} of ${goals.length} done`;
        if (date > today) cell.classList.add("future");
        if (dateKey(date) === dateKey(today)) cell.classList.add("today");
        calendar.appendChild(cell);
    }

    // 6. Put the numbers in the cards
    let rate = 0;
    if (totalGoals > 0) {
        rate = Math.round((totalDone / totalGoals) * 100);
    }
    document.getElementById("stat-done").textContent = totalDone;
    document.getElementById("stat-rate").textContent = rate + "%";
    document.getElementById("stat-days").textContent = activeDays;
    document.getElementById("stat-perfect").textContent = perfectDays;

    showTopGoals(goalCounts);
    noDataText.hidden = totalGoals > 0;

    // Don't let the user go to a month in the future
    nextButton.disabled =
        year === today.getFullYear() && month === today.getMonth();
}

// 7. Pick a shade from 0 (white) to 4 (black) based on the % finished
function colorLevel(doneCount, total) {
    if (total === 0 || doneCount === 0) return 0;
    const percent = doneCount / total;
    if (percent < 0.34) return 1;
    if (percent < 0.67) return 2;
    if (percent < 1) return 3;
    return 4; // 100% done
}

// 8. Show the 5 goals finished most often
function showTopGoals(goalCounts) {
    topGoalsList.innerHTML = "";

    // Object.entries turns {run: 12, read: 8} into [["run", 12], ["read", 8]]
    const sorted = Object.entries(goalCounts).sort(function(a, b) {
        return b[1] - a[1]; // Biggest count first
    });

    sorted.slice(0, 5).forEach(function(entry) {
        const li = document.createElement("li");
        const name = document.createElement("span");
        name.textContent = entry[0];
        const count = document.createElement("strong");
        count.textContent = entry[1] + (entry[1] === 1 ? " time" : " times");
        li.appendChild(name);
        li.appendChild(count);
        topGoalsList.appendChild(li);
    });
}

// 9. Month buttons
prevButton.addEventListener("click", function() {
    shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1);
    showMonth();
});

nextButton.addEventListener("click", function() {
    shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1);
    showMonth();
});

// 10. Fake data for the last 90 days, so you can see the page working
// without waiting a month. It is NOT saved.
function makeSampleData() {
    const ideas = ["Read 10 pages", "Go for a run", "Drink 8 glasses of water",
        "Study JavaScript", "Clean my room", "Practice piano", "Call a friend"];
    const data = {};

    for (let i = 0; i < 90; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const goals = [];
        const howMany = 2 + Math.floor(Math.random() * 4); // 2 to 5 goals
        for (let g = 0; g < howMany; g++) {
            goals.push({
                id: g,
                text: ideas[Math.floor(Math.random() * ideas.length)],
                done: Math.random() < 0.7, // About 70% get done
                removed: false
            });
        }
        data[dateKey(date)] = goals;
    }
    return data;
}

showMonth();
