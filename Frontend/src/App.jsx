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
  const navigate = useNavigate();
  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);

    // Decodificar el token para verificar
    try {
      const decodedToken = JSON.parse(atob(newToken.split(".")[1]));
      console.log(decodedToken);
      console.log(decodedToken?.password);

      // Si la contraseña es 123123 o es primer login, redirigir a cambio de contraseña
      if (decodedToken?.password === "123123" || decodedToken?.first_login) {
        navigate("/change-password");
      }
    } catch (error) {
      console.error("Error verificando token", error);
    }
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
            <ChangePassword
              token={token}
              setIsPasswordChanged={(changed) => {
                // Si el cambio de contraseña es exitoso, navegar al home
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