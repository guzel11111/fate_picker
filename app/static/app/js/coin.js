function flipCoin() {
    const coin = document.getElementById("coin");
    coin.classList.remove("flip");
    void coin.offsetWidth; // перезапуск анимации
    coin.classList.add("flip");

    setTimeout(() => {
        document.getElementById("coin-result").innerText =
            Math.random() > 0.5 ? "Орёл" : "Решка";
    }, 2000);
}
