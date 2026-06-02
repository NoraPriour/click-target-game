async function csrfFetch(url, options = {}) {
    const response = await fetch("/api/csrf");
    const { token, headerName } = await response.json();

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            [headerName]: token
        }
    });
}