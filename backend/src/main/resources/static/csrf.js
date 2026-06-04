async function csrfFetch(url, options = {}) {
    const response = await fetch("/api/csrf");

    if (!response.ok) {
        throw new Error("Impossible de sécuriser la requête. Recharge la page puis réessaie.");
    }

    const { token, headerName } = await response.json();

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            [headerName]: token
        }
    });
}
