document.addEventListener('DOMContentLoaded', function () {
    const wheel = document.getElementById('wheel');
    const ctx = wheel.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    const result = document.getElementById('result');
    const spinCount = document.getElementById('spinCount');
    const categorySelectPanel = document.getElementById('categorySelect');
    const categorySelect = categorySelectPanel.querySelector('select');
    const userCategorySelect = document.getElementById('userCategorySelect');
    const btnCategory = document.getElementById('btnCategory');
    const btnCustom = document.getElementById('btnCustom');
    const btnCreateCategory = document.getElementById('btnCreateCategory');
    const customInputPanel = document.getElementById('customInput');
    const optionInput = document.getElementById('optionInput');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const optionList = document.getElementById('optionList');
    const saveCustomOptionsBtn = document.getElementById('saveCustomOptionsBtn');
    const userCategoryInputPanel = document.getElementById('userCategoryInput');
    const categoryNameInput = document.getElementById('categoryNameInput');
    const userOptionInput = document.getElementById('userOptionInput');
    const addUserOptionBtn = document.getElementById('addUserOptionBtn');
    const userOptionList = document.getElementById('userOptionList');
    const saveUserCategoryBtn = document.getElementById('saveUserCategoryBtn');
    const loadCategoryBtn = document.getElementById('loadCategoryBtn');
    const userCategoryActions = document.getElementById('userCategoryActions');

    const editCategoryModal = document.getElementById('editCategoryModal');
    const editCategoryNameInput = document.getElementById('editCategoryNameInput');
    const editUserOptionInput = document.getElementById('editUserOptionInput');
    const addEditUserOptionBtn = document.getElementById('addEditUserOptionBtn');
    const editUserOptionList = document.getElementById('editUserOptionList');
    const saveEditCategoryBtn = document.getElementById('saveEditCategoryBtn');
    const closeEditCategoryModal = document.getElementById('closeEditCategoryModal');

    let editingCategoryId = null;

    let currentOptions = [];
    let isSpinning = false;
    let mode = 'category';
    let spinCountValue = 0;

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
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(wheel.width / 2, wheel.height / 2, wheel.width / 2 - 10, 0, Math.PI * 2);
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

        ctx.clearRect(0, 0, wheel.width, wheel.height);

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        options.forEach((option, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = startAngle + segmentAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = `hsl(${index * 360 / options.length}, 70%, 80%)`;
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#7c4dff';
            ctx.font = 'bold 16px sans-serif';
            const textRadius = radius - 10;
            const maxTextWidth = textRadius - 30;
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
            let selectedCategoryId = '';
            if (categorySelect.value) {
                selectedCategoryId = String(categorySelect.value);
            } else if (userCategorySelect && userCategorySelect.value) {
                selectedCategoryId = String(userCategorySelect.value);
            }
            
            console.log('Selected category ID (after mutual exclusion): ', selectedCategoryId);
            console.log('Available categories:', categoriesData);

            if (selectedCategoryId && categoriesData[selectedCategoryId]) {
                currentOptions = categoriesData[selectedCategoryId];
                console.log('Selected category options:', currentOptions);
            } else {
                currentOptions = [];
                console.log('No options found for selected category');
            }

            // Update the visibility of edit/delete buttons for user categories
            if (userCategoryActions) {
                const currentSelectedUserCategoryId = userCategorySelect ? userCategorySelect.value : '';
                Array.from(userCategoryActions.children).forEach(button => {
                    const buttonCategoryId = button.getAttribute('data-category-id');
                    if (buttonCategoryId === currentSelectedUserCategoryId) {
                        button.style.display = 'inline-block';
                    } else {
                        button.style.display = 'none';
                    }
                });
            }

        } else if (mode === 'custom') {
            currentOptions = Array.from(optionList.children).map(item => item.querySelector('span').textContent);
            console.log('Custom options:', currentOptions);
        } else if (mode === 'createCategory') {
            currentOptions = Array.from(userOptionList.children).map(item => item.querySelector('span').textContent);
            console.log('User category options (create):', currentOptions);
        } else {
            currentOptions = [];
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

    function showPanel(panelToShow) {
        const panels = [categorySelectPanel, customInputPanel, userCategoryInputPanel];
        panels.forEach(panel => {
            if (panel === panelToShow) {
                panel.classList.add('active-panel');
            } else {
                panel.classList.remove('active-panel');
            }
        });
    }

    btnCategory.addEventListener('click', function () {
        mode = 'category';
        btnCategory.classList.add('active');
        btnCustom.classList.remove('active');
        btnCreateCategory.classList.remove('active');
        showPanel(categorySelectPanel);
        updateWheel();
    });

    btnCustom.addEventListener('click', function () {
        mode = 'custom';
        btnCustom.classList.add('active');
        btnCategory.classList.remove('active');
        btnCreateCategory.classList.remove('active');
        showPanel(customInputPanel);
        updateWheel();
    });

    btnCreateCategory.addEventListener('click', function () {
        mode = 'createCategory';
        btnCreateCategory.classList.add('active');
        btnCategory.classList.remove('active');
        btnCustom.classList.remove('active');
        showPanel(userCategoryInputPanel);
        updateWheel();
    });

    loadCategoryBtn.addEventListener('click', function() {
        // When load button is clicked, we assume the user wants to load the currently selected ready-made category
        // So, clear any user category selection if it exists
        if (userCategorySelect) {
            userCategorySelect.value = '';
            if (userCategoryActions) {
                Array.from(userCategoryActions.children).forEach(button => button.style.display = 'none');
            }
        }
        // Set mode to category explicitly in case it's not already
        mode = 'category';
        // Update the wheel based on the categorySelect value
        updateWheel();
    });

    categorySelect.addEventListener('change', function() {
        if (this.value) {
            if (userCategorySelect) {
                userCategorySelect.value = ''; // Clear user category selection
                if (userCategoryActions) {
                    Array.from(userCategoryActions.children).forEach(button => button.style.display = 'none');
                }
            }
        }
        updateWheel();
    });

    if (userCategorySelect) {
        userCategorySelect.addEventListener('change', function() {
            if (this.value) {
                categorySelect.value = ''; // Clear ready-made category selection
            }
            updateWheel();
        });
    }

    spinBtn.addEventListener('click', function () {
        if (!currentOptions.length) return;

        spinWheel(currentOptions, function (text) {
            result.textContent = `Выпало: ${text}`;
            result.classList.add('show');
            spinCountValue++;
            spinCount.textContent = `Крутили: ${spinCountValue}`;
        });
    });

    if (saveCustomOptionsBtn) {
        saveCustomOptionsBtn.addEventListener('click', function () {
            if (mode !== 'custom') return;
            const options = Array.from(optionList.children).map(item => item.querySelector('span').textContent);
            if (!options.length) {
                alert('Добавьте хотя бы один вариант!');
                return;
            }
            fetch('/api/save_custom_options/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': (document.querySelector('[name=csrfmiddlewaretoken]')||{}).value || ''
                },
                credentials: 'same-origin',
                body: JSON.stringify({options: options, result: ''})
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    alert('Варианты успешно сохранены!');
                } else {
                    alert('Ошибка при сохранении: ' + (data.message || '')); 
                }
            })
            .catch(() => alert('Ошибка при сохранении!'));
        });
    }

    function addUserOption() {
        const option = userOptionInput.value.trim();
        if (option) {
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';
            optionItem.innerHTML = `
                <span>${option}</span>
                <button class="remove-option" onclick="this.parentElement.remove(); updateWheel();">
                    <i class="fas fa-times"></i>
                </button>
            `;
            userOptionList.appendChild(optionItem);
            userOptionInput.value = '';
            updateWheel();
        }
    }

    addUserOptionBtn.addEventListener('click', addUserOption);
    userOptionInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addUserOption();
        }
    });

    saveUserCategoryBtn.addEventListener('click', function () {
        const name = categoryNameInput.value.trim();
        const options = Array.from(userOptionList.children).map(item => item.querySelector('span').textContent);
        console.log('Saving category:', { name, options });
        
        if (!name) {
            alert('Введите название категории!');
            return;
        }
        if (!options.length) {
            alert('Добавьте хотя бы один вариант!');
            return;
        }
        fetch('/api/save_user_category/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': (document.querySelector('[name=csrfmiddlewaretoken]')||{}).value || ''
            },
            credentials: 'same-origin',
            body: JSON.stringify({name: name, options: options})
        })
        .then(response => response.json())
        .then(data => {
            console.log('Save category response:', data)
            if (data.status === 'ok') {
                alert('Категория успешно сохранена!');
                categoryNameInput.value = '';
                userOptionList.innerHTML = '';
                window.location.reload();
            } else {
                alert('Ошибка при сохранении: ' + (data.message || '')); 
            }
        })
        .catch(error => {
            console.error('Error saving category:', error);
            alert('Ошибка при сохранении!');
        });
    });

    if (userCategoryActions) {
        userCategoryActions.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.edit-category-btn');
            const deleteBtn = e.target.closest('.delete-category-btn');

            if (editBtn) {
                editingCategoryId = editBtn.getAttribute('data-category-id');
                editCategoryNameInput.value = editBtn.getAttribute('data-category-name');
                editUserOptionList.innerHTML = '';
                const options = editBtn.getAttribute('data-category-options').split('|').filter(Boolean);
                options.forEach(opt => {
                    const optionItem = document.createElement('div');
                    optionItem.className = 'option-item';
                    optionItem.innerHTML = `
                        <span>${opt}</span>
                        <button class="remove-option" onclick="this.parentElement.remove();\"><i class="fas fa-times"></i></button>
                    `;
                    editUserOptionList.appendChild(optionItem);
                });
                editCategoryModal.style.display = 'flex';
            }

            if (deleteBtn) {
                e.preventDefault();
                const categoryId = deleteBtn.getAttribute('data-category-id');
                if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
                    fetch('/api/delete_user_category/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': (document.querySelector('[name=csrfmiddlewaretoken]')||{}).value || ''
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({category_id: categoryId})
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'ok') {
                            alert('Категория успешно удалена!');
                            window.location.reload();
                        } else {
                            alert('Ошибка при удалении: ' + (data.message || ''));
                        }
                    })
                    .catch(() => alert('Ошибка при удалении!'));
                }
            }
        });
    }

    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'saveEditCategoryBtn') {
            const name = editCategoryNameInput.value.trim();
            const options = Array.from(editUserOptionList.children).map(item => item.querySelector('span').textContent);
            if (!name) {
                alert('Введите название категории!');
                return;
            }
            if (!options.length) {
                alert('Добавьте хотя бы один вариант!');
                return;
            }
            fetch('/api/edit_user_category/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': (document.querySelector('[name=csrfmiddlewaretoken]')||{}).value || ''
                },
                credentials: 'same-origin',
                body: JSON.stringify({category_id: editingCategoryId, name: name, options: options})
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    alert('Категория успешно обновлена!');
                    window.location.reload();
                } else {
                    alert('Ошибка при сохранении: ' + (data.message || ''));
                }
            })
            .catch(() => alert('Ошибка при сохранении!'));
        }
    });

    // Initial setup to show the correct panel based on default mode
    showPanel(categorySelectPanel);
    // Automatically select the first category if available and update the wheel
    function initializeWheel() {
        if (mode === 'category') {
            // First, try to select the first ready-made category that has options
            const firstReadyMadeOption = categorySelect.querySelector('option:not([value=""])');
            if (firstReadyMadeOption) {
                categorySelect.value = firstReadyMadeOption.value;
                if (userCategorySelect) userCategorySelect.value = ''; // Ensure user category is cleared
            } else if (userCategorySelect) {
                // If no ready-made categories, try to select the first user-made category
                const firstUserMadeOption = userCategorySelect.querySelector('option:not([value=""])');
                if (firstUserMadeOption) {
                    userCategorySelect.value = firstUserMadeOption.value;
                    categorySelect.value = ''; // Ensure ready-made category is cleared
                }
            }
            // After initial selection, update the wheel
            updateWheel();
        } else {
            updateWheel(); // For custom mode, ensure initial draw is done
        }
    }

    initializeWheel();
});