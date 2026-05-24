const gameArea = document.querySelector(".game-area");

const btnStart = document.querySelector("#start-btn");
const scoreElement = document.querySelector("#score");

let target;

btnStart.addEventListener("click", () => {
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