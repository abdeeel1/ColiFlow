import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true, // Crucial : autorise l'envoi/réception des cookies
    headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    }
});

// Cette partie force Axios à lire le cookie et à l'envoyer
axiosClient.interceptors.request.use(config => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }
    return config;
});

export default axiosClient;