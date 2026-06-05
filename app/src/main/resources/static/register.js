const registerForm = document.querySelector("#registerForm");
const submitButton = registerForm.querySelector("button");
const registerActions = document.querySelector("#register-actions");

const API_URL = "/api";

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const message = document.querySelector("#message");

    submitButton.disabled = true;
    csrfFetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.json())
        .then(data => {
            message.textContent = data.message;

            if (data.success) {
                message.className = "success";
                submitButton.style.display = "none";

                const playButton = document.createElement("button");
                playButton.type = "button";
                playButton.textContent = "Jouer !";

                playButton.addEventListener("click", () => {
                    window.location.href = "index.html";
                });
                registerActions.innerHTML = "";
                registerActions.appendChild(playButton);

            } else {
                message.className = "error";
                submitButton.disabled = false;
            }
        })
        .catch(error => {
            message.textContent = error.message || "Impossible de contacter le serveur.";
            message.className = "error";
            submitButton.disabled = false;
        });
});
