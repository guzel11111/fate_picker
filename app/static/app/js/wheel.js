function spinWheel(options) {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const radius = size / 2;
    const step = 2 * Math.PI / options.length;

    ctx.clearRect(0, 0, size, size);

    options.forEach((opt, i) => {
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, i * step, (i + 1) * step);
        ctx.fillStyle = `hsl(${i * 360 / options.length}, 70%, 60%)`;
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "14px sans-serif";
        ctx.translate(radius, radius);
        ctx.rotate(step / 2 + i * step);
        ctx.fillText(opt, radius / 2, 0);
        ctx.resetTransform();
    });

    canvas.style.transition = 'transform 3s ease-out';
    canvas.style.transform = `rotate(${720 + Math.random() * 360}deg)`;
}
