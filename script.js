const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeBtn = document.querySelector('.close-btn');
const saveGoalBtn = document.getElementById('saveGoalBtn');
const goalInput = document.getElementById('goalInput');
let chartInstance = null; 

let goal = parseInt(localStorage.getItem('waterGoal')) || 2000;
let current = 0;

let weeklyStats = JSON.parse(localStorage.getItem("weeklyStats") || "{}");
let today = new Date().toISOString().slice(0, 10); 

if (!weeklyStats[today]) {
    weeklyStats[today] = 0;
}
current = weeklyStats[today];


function animateValue(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = `${currentValue}${suffix}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updateDate() {
    const dateElement = document.querySelector('.datee');
    if (!dateElement) return;

    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    
    let formattedDate = now.toLocaleDateString('uk-UA', options);
    
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    dateElement.textContent = formattedDate;
}


function animateWaterLevel(percent) {
    const waterLevel = document.getElementById('waterLevel');
    if (!waterLevel) return;
    waterLevel.style.transition = 'height 0.7s cubic-bezier(.4,0,.2,1)';
    const fillPercent = percent > 100 ? 100 : percent;
    waterLevel.style.height = `${fillPercent}%`;
}

function updateUI(oldCurrent = 0) {
    const waterTextEl = document.getElementById('waterText');
    const counterEl = document.querySelector('.counter');
    const oldRemaining = goal - oldCurrent > 0 ? goal - oldCurrent : 0;
    const newRemaining = goal - current > 0 ? goal - current : 0;

    animateValue(waterTextEl, oldCurrent, current, 500, ' мл');
    animateValue(counterEl, oldRemaining, newRemaining, 500, ' мл залишилося');


    document.getElementById('waterGoalText').textContent = `із ${goal} мл`;
    let percent = Math.round((current / goal) * 100);
    document.querySelector('.water-percentage').textContent = `${percent}%`;

    animateWaterLevel(percent);
    updateWeeklyChart();
}


function saveStats() {
    weeklyStats[today] = current;
    localStorage.setItem("weeklyStats", JSON.stringify(weeklyStats));
}


function addWater(amount) {
    const oldCurrent = current; 
    current += amount;
    saveStats();
    updateUI(oldCurrent); 
}


document.querySelectorAll('.water-plus-item').forEach(item => {
    item.addEventListener('click', function() {
        const amount = parseInt(this.dataset.amount);
        if (!isNaN(amount)) {
            addWater(amount);
        }
    });
});

settingsBtn.addEventListener('click', () => {
    goalInput.value = goal;
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
        const oldCurrent = current;
        goal = newGoal;
        localStorage.setItem('waterGoal', goal);
        updateUI(oldCurrent); 
        settingsModal.style.display = 'none';
    } else {
        alert("Будь ласка, введіть коректне число.");
    }
});



function updateWeeklyChart() {
    const canvas = document.getElementById("weeklyChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const days = Object.keys(weeklyStats).slice(-7);
    const values = days.map(day => weeklyStats[day]);
    const labels = days.map(day => day.slice(5));

    if (chartInstance) {
        chartInstance.destroy();
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
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
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


document.addEventListener('DOMContentLoaded', () => {
    updateDate(); 

    const initialCurrent = current;
    document.getElementById('waterText').textContent = `${initialCurrent} мл`;
    const remaining = goal - initialCurrent > 0 ? goal - initialCurrent : 0;
    document.querySelector('.counter').textContent = `Залишилося ${remaining} мл`;
    
    updateUI(initialCurrent);
});