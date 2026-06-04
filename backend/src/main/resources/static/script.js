const gameArea = document.querySelector(".game-area");

const startButton = document.querySelector("#start-button");
const gameAreaStartButton = document.querySelector("#game-area-start-button");

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
const COUNTDOWN_TOTAL_MS = 4500;
const COUNTDOWN_STEP_MS = COUNTDOWN_TOTAL_MS / 3;

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
                logoutButton.style.display = "block";
                historyButton.textContent = "Voir mes anciens scores";
            } else {
                userStatus.textContent = "";
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
    }).catch(error => {
        console.error(error.message);
    });
});

let target;
let isHistoryVisible = false;

startButton.addEventListener("click", startCountdown);
gameAreaStartButton.addEventListener("click", startCountdown);

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

let isGameStarting = false;

function startCountdown() {
    if (isGameStarting) {
        return;
    }

    isGameStarting = true;

    startButton.style.display = "none";
    gameAreaStartButton.style.display = "none";
    gameArea.classList.remove("game-over");

    gameArea.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    gameArea.innerHTML = `
        <div class="countdown-sequence" style="
            --countdown-step-duration: ${COUNTDOWN_STEP_MS}ms;
            --countdown-second-delay: ${COUNTDOWN_STEP_MS}ms;
            --countdown-third-delay: ${COUNTDOWN_STEP_MS * 2}ms;
        ">
            <span>3</span>
            <span>2</span>
            <span>1</span>
        </div>
    `;

    setTimeout(() => {
        isGameStarting = false;
        startGame();
    }, COUNTDOWN_TOTAL_MS);
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
                <div class="game-over-actions">
                    <a class="button" href="register.html">Crée ton compte pour sauvegarder tes scores</a>
                    <button id="replay-btn" type="button">Rejouer en mode invité</button>
                </div>
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
        .then(response => {
            if (!response.ok) {
                throw new Error("Impossible d'enregistrer le score.");
            }

            displayLeaderboard();
            if (isHistoryVisible) {
                loadHistory();
            }
        })
        .catch(error => {
            console.error(error.message);
        });
}

function displayLeaderboard() {
    fetch(`${API_URL}/leaderboard`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Impossible de charger le classement.");
            }

            return response.json();
        })
        .then(scores => {
            if (!Array.isArray(scores)) {
                throw new Error("Le format du classement est invalide.");
            }

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
        })
        .catch(error => {
            leaderboardList.innerHTML = "";
            const li = document.createElement("li");
            li.textContent = error.message;
            leaderboardList.appendChild(li);
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
        .then(response => {
            if (!response.ok) {
                throw new Error("Impossible de charger ton historique.");
            }

            return response.json();
        })
        .then(scores => {
            if (!Array.isArray(scores)) {
                throw new Error("Le format de l'historique est invalide.");
            }

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
        })
        .catch(error => {
            scoreHistory.innerHTML = "";
            const li = document.createElement("li");
            li.textContent = error.message;
            scoreHistory.appendChild(li);
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
