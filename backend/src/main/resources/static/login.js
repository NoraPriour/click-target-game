const loginForm = document.querySelector("#loginForm");

const API_URL = "/api";

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const message = document.querySelector("#message");

    csrfFetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.text())
        .then(data => {
            if (data === "Connexion réussie") {
                window.location.href = "index.html";
                return;
            }

            message.textContent = data;

            message.className = "error";
        })
        .catch(error => {
            message.className = "error";
            message.textContent = error.message || "Impossible de contacter le serveur.";
        });
});
