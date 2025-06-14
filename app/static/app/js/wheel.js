function drawWheel(options, opts = {}) {
    const canvas = document.getElementById('wheel');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const radius = size / 2;
    ctx.clearRect(0, 0, size, size);

    if (!options || !options.length) return;

    const step = 2 * Math.PI / options.length;
    options.forEach((opt, i) => {
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, i * step, (i + 1) * step);
        // Пастельные тона
        ctx.fillStyle = `hsl(${i * 360 / options.length}, 45%, 85%)`;
        ctx.fill();
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(step / 2 + i * step);
        ctx.fillStyle = "#7c4dff";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(opt, radius / 1.5, 0);
        ctx.restore();
    });
}

let currentRotation = 0;

function spinWheelAnimation(options, showResult, opts = {}) {
    const canvas = document.getElementById('wheel');
    if (!canvas || !options.length) return;
    
    const idx = Math.floor(Math.random() * options.length);
    const targetAngle = 360 / options.length * idx;
    const extraSpins = 360 * 5; // 5 полных оборотов
    const totalRotation = currentRotation + extraSpins + targetAngle;
    
    // Сбрасываем предыдущую анимацию
    canvas.style.transition = 'none';
    canvas.style.transform = `rotate(${currentRotation}deg)`;
    
    // Принудительно вызываем перерисовку
    void canvas.offsetWidth;
    
    // Запускаем новую анимацию
    canvas.style.transition = 'transform 3s cubic-bezier(.17,.67,.83,.67)';
    canvas.style.transform = `rotate(${totalRotation}deg)`;
    
    // Обновляем текущий угол поворота
    currentRotation = totalRotation % 360;
    
    // Показываем результат после завершения анимации
    setTimeout(() => {
        if (typeof showResult === 'function') {
            showResult('Выпало: ' + options[idx]);
        }
    }, 3000);
    
    return idx;
}

// Make functions available globally
window.drawWheel = drawWheel;
window.spinWheelAnimation = spinWheelAnimation;
