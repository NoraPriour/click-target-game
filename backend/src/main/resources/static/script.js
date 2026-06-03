const gameArea = document.querySelector(".game-area");

const startButton = document.querySelector("#start-button");

const scoreElement = document.querySelector("#score");
const timerElement = document.querySelector("#timer");

const leaderboardList = document.querySelector("#leaderboard-list");

const historySection = document.querySelector(".history");
const historySortSection = document.querySelector(".history-sort");
historySortSection.style.display = "none";
const historySort = document.querySelector("#history-sort");
const historyTitle = document.querySelector("#history-title");
const historyButton = document.querySelector("#history-button");
const scoreHistory = document.querySelector("#score-history");

const registerLink = document.querySelector("#register-link");
const loginLink = document.querySelector("#login-link");
let username = null;
const userStatus = document.getElementById("user-status");
const logoutButton = document.querySelector("#logout-button");

const API_URL = "/api";

displayLeaderboard();

loadCurrentUser();

function loadCurrentUser() {
    fetch(`${API_URL}/me`)
        .then(response => {
            if (!response.ok) {
                return null;
            }

            return response.text();
        })
        .then(currentUsername => {
            username = currentUsername;

            if (username) {
                userStatus.textContent = `Connecté en tant que ${username}`;
                registerLink.style.display = "none";
                loginLink.style.display = "none";
                logoutButton.style.display = "inline-block";
                historyButton.textContent = "Voir mes anciens scores";
            } else {
                userStatus.textContent = "Non connecté";
                logoutButton.style.display = "none";
                historyButton.textContent = "S'inscrire pour voir mes anciens scores";
            }
        });
}

logoutButton.addEventListener("click", () => {
    csrfFetch(`${API_URL}/logout`, {
        method: "POST"
    }).then(() => {
        window.location.reload();
    });
});

let target;
let isHistoryVisible = false;

startButton.addEventListener("click", () => {
    startButton.style.display = "none";
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
    const replayButton = document.querySelector("#replay-btn");

    replayButton.addEventListener("click", () => {
        gameArea.classList.remove("game-over");
        startCountdown();
    });
}

function saveScore() {
    csrfFetch(`${API_URL}/scores`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
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

                const usernameSpan = document.createElement("span");
                usernameSpan.textContent = score.username;

                const scoreSpan = document.createElement("span");
                scoreSpan.textContent = `${score.score} points`;

                const dateSpan = document.createElement("span");
                dateSpan.textContent = formatDate(score.date);

                li.append(usernameSpan, scoreSpan, dateSpan);
                leaderboardList.appendChild(li);
            });
        });
};

historyButton.addEventListener("click", () => {
    if (!username) {
        window.location.href = "register.html";
        return;
    }

    historySection.classList.add("is-open");
    historyTitle.textContent = "Mes anciens scores";
    historyButton.style.display = "none";
    isHistoryVisible = true;
    historySortSection.style.display = "block";
    loadHistory();
});

function loadHistory() {
    if (!username) {
        scoreHistory.innerHTML = "<li>Connecte-toi pour voir ton historique.</li>";
        return;
    }

    fetch(`${API_URL}/scores/me?sort=${historySort.value}`)
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

historySort.addEventListener("change", () => {
    if (isHistoryVisible) {
        loadHistory();
    }
});

function formatDate(date) {
    return new Date(date).toLocaleDateString("fr-FR");
}