const gameArea = document.querySelector(".game-area");

const btnStart = document.querySelector("#start-btn");

const scoreElement = document.querySelector("#score");
const timerElement = document.querySelector("#timer");

const leaderboardList = document.querySelector("#leaderboard-list");

const historySection = document.querySelector(".history");
const historyTitle = document.querySelector("#history-title");
const historyBtn = document.querySelector("#history-btn");
const scoreHistory = document.querySelector("#score-history");

const registerLink = document.querySelector("#register-link");
const loginLink = document.querySelector("#login-link");
const username = localStorage.getItem("username");
const userStatus = document.getElementById("user-status");
const logoutBtn = document.querySelector("#logout-btn");

const API_URL = "http://localhost:8080/api";

displayLeaderboard();

if (username) {
    userStatus.textContent = `Connecté en tant que ${username}`;
    registerLink.style.display = "none";
    loginLink.style.display = "none";
    logoutBtn.style.display = "inline-block";
    historyBtn.textContent = "Voir mes anciens scores";
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("username");
        window.location.reload();
    });

} else {
    userStatus.textContent = "Non connecté";
    logoutBtn.style.display = "none";
    historyBtn.textContent = "S'inscrire pour voir mes anciens scores";

}

let target;
let isHistoryVisible = false;

btnStart.addEventListener("click", () => {
    btnStart.style.display = "none";
    gameArea.classList.remove("game-over");
    startCountdown();
});

function startGame() {
    let timeLeft = 30;
    let score = 0;

    timerElement.textContent = timeLeft;
    scoreElement.textContent = score;

    gameArea.innerHTML = `<button id="target" type="button"></button>`;

    target = document.querySelector("#target");
    moveTarget();

    target.addEventListener("click", () => {
        score++;
        scoreElement.textContent = score;
        moveTarget();
    });

    const timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            showGameOver(score);
        }
    }, 1000);
}

function startCountdown() {
    gameArea.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    let countdown = 3;
    gameArea.innerHTML = `<div class="countdown">${countdown}</div>`;

    const countdownInterval = setInterval(() => {
        countdown--;

        if (countdown > 0) {
            gameArea.innerHTML = `<div class="countdown">${countdown}</div>`;
        } else {
            clearInterval(countdownInterval);
            startGame();
        }
    }, 1000);
}

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

function showGameOver(score) {
    gameArea.classList.add("game-over");

    if (username) {
        gameArea.innerHTML = `
            <div class="game-over-content">
                <h2>Temps écoulé !</h2>
                <p>Ton score : ${score}</p>
                <button id="replay-btn" type="button">Rejouer</button>
            </div>
`;
        saveScore();
    } else {
        gameArea.innerHTML = `
            <div class="game-over-content">
                <h2>Temps écoulé !</h2>
                <p>Ton score : ${score}</p>
                <a href="register.html">Crée ton compte pour sauvegarder tes scores.</a>
                <button id="replay-btn" type="button">Rejouer en mode invité</button>
            </div>
`;
    }
    const replayBtn = document.querySelector("#replay-btn");

    replayBtn.addEventListener("click", () => {
        gameArea.classList.remove("game-over");
        startCountdown();
    });
}

function saveScore() {
    fetch(`${API_URL}/scores`, {
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
            if (data === "Score saved") {
                displayLeaderboard();
                if (isHistoryVisible) {
                    loadHistory();
                }
            }
        });
}

function displayLeaderboard() {
    fetch(`${API_URL}/leaderboard`)
        .then(response => response.json())
        .then(scores => {
            leaderboardList.innerHTML = "";
            scores.forEach(score => {
                const li = document.createElement("li");
                li.className = "score-row";

                const formattedDate = formatDate(score.date);

                li.innerHTML = `
                    <span>${score.username}</span>
                    <span>${score.score} points</span>
                    <span>${formattedDate}</span>
                `;

                leaderboardList.appendChild(li);
            });
        });
};

historyBtn.addEventListener("click", () => {
    if (!username) {
        window.location.href = "register.html";
        return;
    }

    historySection.classList.add("is-open");
    historyTitle.textContent = "Mes anciens scores";
    historyBtn.style.display = "none";
    isHistoryVisible = true;
    loadHistory();
});

function loadHistory() {
    if (!username) {
        scoreHistory.innerHTML = "<li>Connecte-toi pour voir ton historique.</li>";
        return;
    }

    fetch(`${API_URL}/scores/${username}`)
        .then(response => response.json())
        .then(scores => {
            scoreHistory.innerHTML = "";

            if (scores.length === 0) {
                scoreHistory.innerHTML = "<li>Aucune partie enregistrée.</li>";
                return;
            }

            scores.forEach(score => {
                const li = document.createElement("li");
                const formattedDate = formatDate(score.date);
                li.textContent = `${formattedDate} - ${score.score} points`;
                scoreHistory.appendChild(li);
            });
        });
};

function formatDate(date) {
    return new Date(date).toLocaleDateString("fr-FR");
}