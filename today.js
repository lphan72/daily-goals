// today.js runs on index.html.
// It shows today's goals, lets you add, check and remove them.

// 1. Load everything that was saved, and find today's list
let allGoals = loadAllGoals();
const todayKey = dateKey(new Date());

// If today has no list yet, make an empty one
if (!allGoals[todayKey]) {
    allGoals[todayKey] = [];
}

// 2. Get HTML elements
const form = document.getElementById("goal-form");
const goalInput = document.getElementById("goal-input");
const goalList = document.getElementById("goal-list");
const emptyText = document.getElementById("empty");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const clearDoneButton = document.getElementById("clear-done");

// 3. Show today's date, like "Wednesday, November 4"
document.getElementById("today-date").textContent =
    new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

// Small helper so we don't repeat this line everywhere
function todaysGoals() {
    return allGoals[todayKey];
}

// 4. Add a new goal
function addGoal(event) {
    // A form normally reloads the page when submitted. This stops that.
    event.preventDefault();

    // trim() removes spaces at the start and end
    const text = goalInput.value.trim();
    if (text === "") {
        return; // Don't add empty goals
    }

    todaysGoals().push({
        id: Date.now(), // The current time in milliseconds: a simple unique id
        text: text,
        done: false,
        removed: false
    });

    saveAllGoals(allGoals);
    goalInput.value = "";
    goalInput.focus();
    updatePage();
}

// 5. Check / uncheck a goal with one click
function toggleGoal(id) {
    const goal = todaysGoals().find(function(goal) {
        return goal.id === id;
    });
    goal.done = !goal.done; // ! flips true to false and false to true

    saveAllGoals(allGoals);
    updatePage();
}

// 6. Remove a goal
// - A FINISHED goal is only hidden (removed: true), so it still counts
//   in your monthly stats.
// - An UNFINISHED goal is deleted for real (you probably added it by mistake).
function removeGoal(id) {
    const goals = todaysGoals();
    const index = goals.findIndex(function(goal) {
        return goal.id === id;
    });

    if (goals[index].done) {
        goals[index].removed = true;
    } else {
        goals.splice(index, 1);
    }

    saveAllGoals(allGoals);
    updatePage();
}

// 7. Remove every finished goal at once
function clearDone() {
    todaysGoals().forEach(function(goal) {
        if (goal.done) {
            goal.removed = true;
        }
    });

    saveAllGoals(allGoals);
    updatePage();
}

// 8. Draw the list and the progress bar again (like updateOrder in Example 5)
function updatePage() {
    goalList.innerHTML = "";

    const goals = todaysGoals();
    const visibleGoals = goals.filter(function(goal) {
        return !goal.removed;
    });

    visibleGoals.forEach(function(goal) {
        const li = document.createElement("li");
        li.className = goal.done ? "goal done" : "goal";

        // A <label> around the checkbox means clicking the TEXT also checks it
        const label = document.createElement("label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = goal.done;
        checkbox.addEventListener("change", function() {
            toggleGoal(goal.id);
        });

        const span = document.createElement("span");
        span.textContent = goal.text; // textContent is safe: it never runs code

        label.appendChild(checkbox);
        label.appendChild(span);

        const removeButton = document.createElement("button");
        removeButton.textContent = "×";
        removeButton.className = "remove";
        removeButton.setAttribute("aria-label", "Remove " + goal.text);
        removeButton.addEventListener("click", function() {
            removeGoal(goal.id);
        });

        li.appendChild(label);
        li.appendChild(removeButton);
        goalList.appendChild(li);
    });

    // Progress counts ALL of today's goals, even hidden finished ones
    const total = goals.length;
    const doneCount = goals.filter(function(goal) {
        return goal.done;
    }).length;

    let percent = 0;
    if (total > 0) {
        percent = Math.round((doneCount / total) * 100);
    }

    progressFill.style.width = percent + "%";
    progressText.textContent = `${doneCount} of ${total} done (${percent}%)`;

    emptyText.hidden = visibleGoals.length > 0;
    clearDoneButton.hidden = !visibleGoals.some(function(goal) {
        return goal.done;
    });
}

// 9. Connect the form and button to functions, then draw the page
form.addEventListener("submit", addGoal);
clearDoneButton.addEventListener("click", clearDone);
updatePage();
