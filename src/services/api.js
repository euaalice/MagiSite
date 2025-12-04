import axios from "axios"

const baseURLHerku = "https://magiscoreserver-8a06a6a14420.herokuapp.com/server/"
const baseURLLocal = "http://localhost:5000/server/"
const api = axios.create({baseURL:baseURLHerku  });

// Adiciona o token no header de todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
