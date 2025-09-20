let goal = 2000;
let current = 0;

function updateUI() {
    // Оновлення рівня води
    document.getElementById('waterText').textContent = `${current} мл`;
    // Оновлення залишку
    document.querySelector('.counter').textContent = `Залишилося ${goal - current > 0 ? goal - current : 0} мл`;
    // Оновлення відсотка
    let percent = Math.round((current / goal) * 100);
    document.querySelector('.water-percentage').textContent = `${percent > 100 ? 100 : percent}%`;
}

document.querySelectorAll('.water-plus-item').forEach(item => {
    item.addEventListener('click', function() {
        // Знаходимо кількість мл у цьому елементі
        let mlText = item.querySelector('.ml').textContent;
        let ml = parseInt(mlText);
        current += ml;
        if (current > goal) current = goal;
        updateUI();
    });
});

function animateWaterLevel(percent) {
    const waterLevel = document.getElementById('waterLevel');
    // Встановлюємо висоту води відповідно до відсотка (максимум 100%)
    waterLevel.style.transition = 'height 0.7s cubic-bezier(.4,0,.2,1)';
    waterLevel.style.height = `${percent > 100 ? 100 : percent}%`;
}

function updateUI() {
    document.getElementById('waterText').textContent = `${current} мл`;
    document.querySelector('.counter').textContent = `Залишилося ${goal - current > 0 ? goal - current : 0} мл`;
    let percent = Math.round((current / goal) * 100);
    document.querySelector('.water-percentage').textContent = `${percent > 100 ? 100 : percent}%`;
    animateWaterLevel(percent);
}
