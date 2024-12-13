import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './component/Login';
import Reclamos from './component/Reclamos';
import CrearReclamo from './component/CrearReclamo';
import ChangePassword from './component/ChangePassword';

// Componente de ruta protegida
// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ token, children }) => {
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const navigate = useNavigate();   
  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    // Decodificar el token para verificar
    try {
      const decodedToken = JSON.parse(atob(newToken.split(".")[1]));         
      setUserId(decodedToken.id);    
      localStorage.setItem("userId", userId);
      // Si la contraseña es 123123 o es primer login, redirigir a cambio de contraseña
      if (decodedToken?.password === "123123" || decodedToken?.first_login) {
        navigate(`/change-password/${userId}`); 
      }
    } catch (error) {
      console.error("Error verificando token", error);
    }
  };

  const handleLogout = () => {
    setToken(null);    
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
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
        path="/change-password/:id" // Parámetro de la URL
        element={
          <ChangePassword
            token={token}
            setIsPasswordChanged={(changed) => {
              if (changed) {
                navigate("/");
              }
            }}
          />
        }
      />
    </Routes>
  );
}

export default App;