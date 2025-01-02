import axios from 'axios';

const API = axios.create({
  baseURL: 'https://reclamos-production-2298.up.railway.app/', // https//localhost:3000 
});

// Configurar los encabezados globalmente
API.defaults.headers.common['Content-Type'] = 'application/json';

// Agregar el interceptor para agregar el token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Aquí puedes agregar encabezados específicos para CORS si lo necesitas
API.interceptors.request.use((config) => {
  config.headers['Access-Control-Allow-Origin'] = '*';  // Permitir solicitudes de cualquier origen
  return config;
});

export default API;
