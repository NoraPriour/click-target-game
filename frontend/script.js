const gameArea = document.querySelector(".game-area");

const btnStart = document.querySelector("#start-btn");

const scoreElement = document.querySelector("#score");
const timerElement = document.querySelector("#timer");

const leaderboardList = document.querySelector("#leaderboard-list");

const historyBtn = document.querySelector("#history-btn");
const scoreHistory = document.querySelector("#score-history");

const username = localStorage.getItem("username");
const userStatus = document.getElementById("user-status");

displayLeaderboard();

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

function displayLeaderboard() {
    fetch("http://localhost:8080/api/leaderboard")
        .then(response => response.json())
        .then(scores => {
            leaderboardList.innerHTML = "";
            scores.forEach(score => {
                const li = document.createElement("li");
                li.textContent = `${score.username} : ${score.score}`;
                leaderboardList.appendChild(li);
            });
        });
};

historyBtn.addEventListener("click", () => {
    historyBtn.style.display = "none";
    if (!username) {
        scoreHistory.innerHTML = "<li>Connecte-toi pour voir ton historique.</li>";
        return;
    }

    fetch(`http://localhost:8080/api/scores/${username}`)
        .then(response => response.json())
        .then(scores => {
            scoreHistory.innerHTML = "";

            if (scores.length === 0) {
                scoreHistory.innerHTML = "<li>Aucune partie enregistrée.</li>";
                return;
            }

            scores.forEach(score => {
                const li = document.createElement("li");
                li.textContent = `Score : ${score.score} - le ${score.date}`;
                scoreHistory.appendChild(li);
            });
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
            if (data === "Score saved") {
                historyBtn.click();
            }
        });
}