import axios from "axios"

const baseURLHeroku = "https://magiscoreserver-8a06a6a14420.herokuapp.com/server/"
const baseURLLocal = "http://localhost:8080/server/"
const api = axios.create({baseURL: baseURLLocal});

// Adiciona o token no header de todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
