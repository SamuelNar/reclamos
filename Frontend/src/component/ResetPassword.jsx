import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import '../assets/styles/resetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post('/reset-password', { token, newPassword });

      if (response.status === 200) {
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
      setError(err.response?.data?.error || 'Token inválido o expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <form onSubmit={handleSubmit}>
        <h2>Cambiar Contraseña</h2>
        <p>Introduce una nueva contraseña para tu cuenta.</p>
        
        <div className="form-group">
          <label htmlFor="new-password">Nueva Contraseña</label>
          <input
            className="input-field"
            id="new-password"
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm-password">Confirmar Contraseña</label>
          <input
            className="input-field"
            id="confirm-password"
            type="password"
            placeholder="Confirma tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button className="submit-btn" type="submit" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Actualizar Contraseña'}
        </button>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;