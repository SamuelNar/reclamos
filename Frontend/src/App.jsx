import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './component/Login';
import Reclamos from './component/Reclamos';
import CrearReclamo from './component/CrearReclamo';

// Componente de ruta protegida
// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ token, children }) => {
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLogin={handleLogin} />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute token={token}>
            <Reclamos token={token} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />     
      <Route
        path="/reclamos"
        element={
          <ProtectedRoute token={token}>
            <Reclamos token={token} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reclamos/:id"
        element={
          <ProtectedRoute token={token}>
            <CrearReclamo token={token} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/crear"
        element={
          <ProtectedRoute token={token}>
            <CrearReclamo token={token} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute token={token}>
            <ChangePas
              token={token} 
              onPasswordChanged={() => {
                // Opcional: cualquier lógica después de cambiar la contraseña
              }} 
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;