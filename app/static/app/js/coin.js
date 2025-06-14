function flipCoin() {
    const coin = document.getElementById("coin");
    coin.classList.remove("flip");
    void coin.offsetWidth; // перезапуск анимации
    coin.classList.add("flip");

    setTimeout(() => {
        const res = Math.random() > 0.5 ? "Орёл" : "Решка";
        document.getElementById("coin-result").innerText = res;
        // Отправка результата в историю
        fetch('/api/save_history/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': (document.querySelector('[name=csrfmiddlewaretoken]')||{}).value || ''
            },
            credentials: 'same-origin',
            body: JSON.stringify({method: 'coin', result: res})
        });
    }, 2000);
}
