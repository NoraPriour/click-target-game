const registerForm = document.querySelector("#registerForm");

const registerActions = document.querySelector("#register-actions");

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.text())
        .then(data => {
            const message = document.querySelector("#message");
            message.textContent = data;

            if (data === "User created") {
                message.className = "success";
                localStorage.setItem("username", username);

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
            }
        })
        .catch(error => {
            const message = document.querySelector("#message");
            message.textContent = "Impossible de contacter le serveur.";
            message.className = "error";
        });
});