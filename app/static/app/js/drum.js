function spinDrum(options) {
    const output = document.getElementById("drum-result");
    output.innerText = "Крутим...";

    setTimeout(() => {
        const choice = options[Math.floor(Math.random() * options.length)];
        output.innerText = choice;
    }, 2000);
}
