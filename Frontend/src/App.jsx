import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './component/Login';
import Reclamos from './component/Reclamos';
import CrearReclamo from './component/CrearReclamo';
import ChangePassword from './component/ChangePassword';
import Perfil from './component/Perfil';
import FormRecover from './component/FormRecover';
import ResetPassword from './component/ResetPassword';
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
    console.log("Token",newToken);
    try {
      const decodedToken = JSON.parse(atob(newToken.split(".")[1]));         
      const currentUserId = decodedToken.id;
      localStorage.setItem("userId",currentUserId);
      // Si la contraseña es 123123 o es primer login, redirigir a cambio de contraseña
      if (decodedToken?.password === "123123" || decodedToken?.first_login) {
        navigate(`/change-password/${currentUserId}`); 
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

  const handleBack = () => {
    navigate('/');
  }

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
        path="/change-password/:id"
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
      <Route
        path='/perfil/:id'
        element={
          <ProtectedRoute token={token}>
            <Perfil/>
          </ProtectedRoute>
        }
      />
      <Route
        path='*'
        element={
          <div>
            <h1>404</h1>
            <p>Página no encontrada</p>
            <button onClick={handleBack}>Volver al inicion</button>
          </div>
        }
      />
      <Route path="/forgot-password" element={<FormRecover />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;