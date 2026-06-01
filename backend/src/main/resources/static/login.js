const loginForm = document.querySelector("#loginForm");

const API_URL = "/api";

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.text())
        .then(data => {
            if (data === "Login successful") {
                localStorage.setItem("username", username);
                window.location.href = "index.html";
            }
            const message = document.querySelector("#message");
            message.textContent = data;

            if (data === "Login successful" || data === "User created") {
                message.className = "success";
            } else {
                message.className = "error";
            }
        })
        .catch(error => {
            document.querySelector("#message").textContent = "Impossible de contacter le serveur.";
        });
});
