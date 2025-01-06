import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import API from '../utils/api';
import '../assets/styles/login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await API.post('/auth/login', { username, password });

      if (response.data && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decodedToken = JSON.parse(atob(response.data.token.split('.')[1]));
        const userId = decodedToken?.id;
        const userRole = decodedToken?.rol;
        localStorage.setItem('userId', userId);
        if (decodedToken?.password === '123123' || decodedToken?.first_login) {
          navigate(`/change-password/${decodedToken.id}`);
        }
        if (userRole === 'cliente') {
          navigate(`/reclamos`);
        } else {
          navigate('/');
        }
        onLogin(response.data.token);
      } else {
        setError('Respuesta del servidor inesperada');
      }
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <img className="login-logo" src="assets/LogoLiderCom.webp" alt="Logo LiderCom" />
        <h2>Sistema de Reclamos</h2>
        <div className="form-group">
          <label htmlFor="username">Ingrese su nombre de usuario</label>
          <input
            className="input-field"
            id="username"
            type="text"
            placeholder="Ingrese su usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Ingrese su contraseña</label>
          <div className="password-container">
            <input
              className="input-field"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && ( // Mostrar el botón solo si hay texto
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            )}
          </div>
        </div>
        <button className="login-btn" type="submit">Iniciar Sesión</button>
        {error && <p className="error-message">{error}</p>}
        <p className="forgot-password">
          ¿Olvidaste tu contraseña? <Link to="/forgot-password">Recupérala aquí</Link>
        </p>
      </form>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
