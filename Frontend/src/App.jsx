import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './component/Login';
import Reclamos from './component/Reclamos';
import CrearReclamo from './component/CrearReclamo';

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
        element={<Reclamos token={token} onLogout={handleLogout} />}
      />     
      <Route
        path="/reclamos"
        element={<Reclamos token={token} onLogout={handleLogout} />}
      />
      <Route
        path="/reclamos/:id"
        element={ <CrearReclamo /> }
      />
      <Route
        path="/crear"
        element={<CrearReclamo /> }
      />
    </Routes>
  );
}

export default App;
