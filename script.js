// ===== GLOBAL VARIABLES & DOM ELEMENTS =====
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeBtn = document.querySelector('.close-btn');
const saveGoalBtn = document.getElementById('saveGoalBtn');
const goalInput = document.getElementById('goalInput');
let chartInstance = null; // To hold the chart instance

// Load goal from localStorage or set a default value
let goal = parseInt(localStorage.getItem('waterGoal')) || 2000;
let current = 0;

// ===== DATA HANDLING =====
let weeklyStats = JSON.parse(localStorage.getItem("weeklyStats") || "{}");
let today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format

// Initialize today's data if it doesn't exist
if (!weeklyStats[today]) {
    weeklyStats[today] = 0;
}
current = weeklyStats[today];

// ===== UI UPDATES =====

/**
 * Animates the water level in the main circle.
 * @param {number} percent - The percentage to fill.
 */
function animateWaterLevel(percent) {
    const waterLevel = document.getElementById('waterLevel');
    if (!waterLevel) return;
    waterLevel.style.transition = 'height 0.7s cubic-bezier(.4,0,.2,1)';
    const fillPercent = percent > 100 ? 100 : percent;
    waterLevel.style.height = `${fillPercent}%`;
}

/**
 * Updates all relevant parts of the UI with current data.
 */
function updateUI() {
    document.getElementById('waterText').textContent = `${current} мл`;
    document.getElementById('waterGoalText').textContent = `із ${goal} мл`; // Update goal text
    const remaining = goal - current;
    document.querySelector('.counter').textContent = `Залишилося ${remaining > 0 ? remaining : 0} мл`;

    let percent = Math.round((current / goal) * 100);
    document.querySelector('.water-percentage').textContent = `${percent}%`;

    animateWaterLevel(percent);
    updateWeeklyChart();
}

// ===== DATA PERSISTENCE =====

/**
 * Saves the weekly statistics to localStorage.
 */
function saveStats() {
    weeklyStats[today] = current;
    localStorage.setItem("weeklyStats", JSON.stringify(weeklyStats));
}

// ===== CORE LOGIC =====

/**
 * Adds a specified amount of water to the current total.
 * @param {number} amount - The amount of water to add in ml.
 */
function addWater(amount) {
    current += amount;
    // Don't cap at goal to allow for over-achieving, but chart will cap visually
    saveStats();
    updateUI();
}

// ===== EVENT LISTENERS =====

// Add water buttons
document.querySelectorAll('.water-plus-item').forEach(item => {
    item.addEventListener('click', function() {
        const amount = parseInt(this.dataset.amount);
        if (!isNaN(amount)) {
            addWater(amount);
        }
    });
});

// Settings Modal Listeners
settingsBtn.addEventListener('click', () => {
    goalInput.value = goal; // Show current goal in input
    settingsModal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == settingsModal) {
        settingsModal.style.display = 'none';
    }
});

saveGoalBtn.addEventListener('click', () => {
    const newGoal = parseInt(goalInput.value);
    if (newGoal && newGoal > 0) {
        goal = newGoal;
        localStorage.setItem('waterGoal', goal); // Save the new goal
        updateUI(); // Re-render the UI with the new goal
        settingsModal.style.display = 'none';
    } else {
        alert("Будь ласка, введіть коректне число.");
    }
});


// ===== CHART LOGIC =====

/**
 * Draws or updates the weekly statistics chart.
 */
function updateWeeklyChart() {
    const canvas = document.getElementById("weeklyChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const days = Object.keys(weeklyStats).slice(-7); // Get last 7 days
    const values = days.map(day => weeklyStats[day]);
    const labels = days.map(day => day.slice(5)); // Format date as "MM-DD"

    if (chartInstance) {
        chartInstance.destroy(); // Destroy old chart before creating a new one
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Випито води (мл)',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                borderRadius: 5,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + ' мл';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Випито: ${context.raw} мл`;
                        }
                    }
                }
            }
        }
    });
}


// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', updateUI);