import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import './login.css';

// eslint-disable-next-line react/prop-types
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await API.post('/auth/login', { 
        username, 
        password 
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLogin(response.data.token);
        navigate('/');
      } else {
        setError('Respuesta del servidor inesperada');
      }
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    }
  };

  const handleHome = () => {
    navigate("/");
  }

  return (
    <div className="login-container">
      <div className='home_button_container'>
        <button onClick={handleHome} className="home_button">Inicio</button>
      </div>
      <form onSubmit={handleSubmit}>
        
        <h2>Iniciar Sesión</h2>
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
          <input
            className='input_username'
            id="username"
            type="text"
            placeholder="Ingrese su usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            className='input_password'
            id="password"
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className='login_button' type="submit">Iniciar Sesión</button>        
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Login;