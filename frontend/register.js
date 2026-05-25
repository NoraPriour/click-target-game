const registerForm = document.querySelector("#registerForm");

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username : username, password : password })
    })
    .then(response => response.text())
    .then(data => {
        document.querySelector("#message").textContent = data;
    });
});