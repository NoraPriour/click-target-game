const gameArea = document.querySelector(".game-area");

const btnStart = document.querySelector("#start-btn");

const scoreElement = document.querySelector("#score");
const timerElement = document.querySelector("#timer");

const username = localStorage.getItem("username");
const userStatus = document.getElementById("user-status");
if (username) {
    userStatus.textContent = `Connecté en tant que ${username}`;
} else {
    userStatus.textContent = "Non connecté";
}

let target;



btnStart.addEventListener("click", () => {
    btnStart.style.display = "none";
    gameArea.classList.remove("game-over");
    let timeLeft = 30;
    timerElement.textContent = timeLeft;
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            gameArea.classList.add("game-over");
            if (username) {
                gameArea.innerHTML = `<h2>Temps écoulé ! Ton score : ${scoreElement.textContent}</h2>`;
                saveScore();
            } else {
                gameArea.innerHTML = `<h2>Temps écoulé ! Ton score : ${scoreElement.textContent}</h2>
        <p>Connecte-toi pour sauvegarder tes scores.</p>`;
            }
            btnStart.style.display = "inline-block";
        }
    }, 1000);
    let score = 0;
    scoreElement.textContent = score;
    gameArea.innerHTML = `<button id="target" type="button"></button>`;

    target = document.querySelector("#target");
    moveTarget();
    target.addEventListener("click", () => {
        score++;
        scoreElement.textContent = score;
        moveTarget();
    });

});

function moveTarget() {
    const gameAreaRect = gameArea.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const maxX = gameAreaRect.width - targetRect.width;
    const maxY = gameAreaRect.height - targetRect.height;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;
}

function saveScore() {
    fetch("http://localhost:8080/api/scores", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username: username,
        score: Number(scoreElement.textContent)
    })
})
.then(response => response.text())
.then(data => {
    console.log(data);
});
}