function spinDrum(options) {
    const output = document.getElementById("drum-result");
    output.innerText = "Крутим...";

    setTimeout(() => {
        const choice = options[Math.floor(Math.random() * options.length)];
        output.innerText = choice;
        // Отправка результата в историю
        fetch('/api/save_history/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': (document.querySelector('[name=csrfmiddlewaretoken]')||{}).value || ''
            },
            credentials: 'same-origin',
            body: JSON.stringify({method: 'custom', result: choice})
        });
    }, 2000);
}
