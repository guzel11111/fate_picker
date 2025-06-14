document.addEventListener('DOMContentLoaded', function () {
    const wheel = document.getElementById('wheel');
    const ctx = wheel.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    const result = document.getElementById('result');
    const spinCount = document.getElementById('spinCount');
    const categorySelect = document.querySelector('#categorySelect select');
    const btnCategory = document.getElementById('btnCategory');
    const btnCustom = document.getElementById('btnCustom');
    const customInput = document.getElementById('customInput');
    const optionInput = document.getElementById('optionInput');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const optionList = document.getElementById('optionList');

    let currentOptions = [];
    let isSpinning = false;
    let mode = 'category';
    let spinCountValue = 0;

    // Получение данных из JSON
    const categoriesJson = document.getElementById('categories-json').textContent;
    console.log('Raw categories JSON:', categoriesJson);
    
    let categoriesData;
    try {
        categoriesData = JSON.parse(categoriesJson);
        console.log('Parsed categories data:', categoriesData);
    } catch (e) {
        console.error('Error parsing categories JSON:', e);
        categoriesData = {};
    }

    // Функция для обрезки текста с троеточием справа
    function fitTextOnCanvas(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) {
            return text;
        }
        while (text.length > 0 && ctx.measureText(text + '...').width > maxWidth) {
            text = text.slice(0, -1);
        }
        return text + '...';
    }

    function drawWheel(options) {
        console.log('Drawing wheel with options:', options);
        if (!options || options.length === 0) {
            console.log('No options to draw');
            ctx.clearRect(0, 0, wheel.width, wheel.height);
            // Рисуем белый фон
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(wheel.width/2, wheel.height/2, wheel.width/2 - 10, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        const centerX = wheel.width / 2;
        const centerY = wheel.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        const segmentAngle = (2 * Math.PI) / options.length;

        console.log('Drawing wheel segments:', {
            centerX,
            centerY,
            radius,
            segmentAngle,
            optionsCount: options.length
        });

        // Очищаем канвас
        ctx.clearRect(0, 0, wheel.width, wheel.height);

        // Рисуем белый фон
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Рисуем сегменты
        options.forEach((option, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = startAngle + segmentAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            // Используем более яркие цвета для сегментов
            ctx.fillStyle = `hsl(${index * 360 / options.length}, 70%, 80%)`;
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Рисуем текст
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#7c4dff';
            ctx.font = 'bold 16px sans-serif';
            const textRadius = radius - 10; // ближе к краю круга
            const maxTextWidth = textRadius - 30; // чуть дальше от центра
            const displayText = fitTextOnCanvas(ctx, option, maxTextWidth);
            ctx.fillText(displayText, textRadius, 5);
            ctx.restore();
        });
    }

    function spinWheel(options, onComplete) {
        if (isSpinning || !options.length) return;

        isSpinning = true;
        spinBtn.disabled = true;
        result.classList.remove('show');

        const segmentAngle = 360 / options.length;
        const selectedIndex = Math.floor(Math.random() * options.length);
        const targetAngle = segmentAngle * selectedIndex + segmentAngle / 2;
        const totalRotation = 360 * 5 + (360 - targetAngle);

        wheel.style.transition = 'none';
        wheel.style.transform = `rotate(0deg)`;
        void wheel.offsetWidth;

        wheel.style.transition = 'transform 4s cubic-bezier(.17,.67,.83,.67)';
        wheel.style.transform = `rotate(${totalRotation}deg)`;

        setTimeout(() => {
            if (typeof onComplete === 'function') {
                onComplete(options[selectedIndex]);
            }
            // Отправка результата в историю
            let categoryId = null;
            if (mode === 'category') {
                categoryId = categorySelect.value || null;
            }
            fetch('/api/save_history/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': (document.querySelector('[name=csrfmiddlewaretoken]')||{}).value || ''
                },
                credentials: 'same-origin',
                body: JSON.stringify({method: 'wheel', result: options[selectedIndex], category_id: categoryId})
            });
            isSpinning = false;
            spinBtn.disabled = false;
        }, 4000);
    }

    function updateWheel() {
        console.log('Updating wheel, mode:', mode);
        if (mode === 'category') {
            const selectedCategory = categorySelect.value;
            console.log('Selected category:', selectedCategory);
            console.log('Available categories:', categoriesData);
            
            if (selectedCategory && categoriesData[selectedCategory]) {
                currentOptions = categoriesData[selectedCategory];
                console.log('Selected category options:', currentOptions);
            } else {
                currentOptions = [];
                console.log('No options found for selected category');
            }
        } else {
            currentOptions = Array.from(optionList.children).map(item => item.querySelector('span').textContent);
            console.log('Custom options:', currentOptions);
        }
        drawWheel(currentOptions);
    }

    function addOption() {
        const option = optionInput.value.trim();
        if (option) {
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';
            optionItem.innerHTML = `
                <span>${option}</span>
                <button class="remove-option" onclick="this.parentElement.remove(); updateWheel();">
                    <i class="fas fa-times"></i>
                </button>
            `;
            optionList.appendChild(optionItem);
            optionInput.value = '';
            updateWheel();
        }
    }

    addOptionBtn.addEventListener('click', addOption);
    optionInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addOption();
        }
    });

    btnCategory.addEventListener('click', function () {
        mode = 'category';
        btnCategory.classList.add('active');
        btnCustom.classList.remove('active');
        customInput.style.display = 'none';
        categorySelect.style.display = 'block';
        updateWheel();
    });

    btnCustom.addEventListener('click', function () {
        mode = 'custom';
        btnCustom.classList.add('active');
        btnCategory.classList.remove('active');
        customInput.style.display = 'block';
        categorySelect.style.display = 'none';
        updateWheel();
    });

    categorySelect.addEventListener('change', function () {
        console.log('Category changed to:', this.value);
        if (mode === 'category') {
            updateWheel();
        }
    });

    spinBtn.addEventListener('click', function () {
        if (!currentOptions.length) return;

        spinWheel(currentOptions, function (text) {
            result.textContent = `Выпало: ${text}`;
            result.classList.add('show');
            spinCountValue++;
            spinCount.textContent = `Крутили: ${spinCountValue}`;
        });
    });

    // Первичная отрисовка
    updateWheel();
});

