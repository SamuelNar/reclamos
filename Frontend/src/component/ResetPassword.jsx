import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import '../assets/styles/reset-password.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Obtener el token de la URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // Enviar la solicitud al backend para cambiar la contraseña
      const response = await API.post('/reset-password', { token, newPassword });

      if (response.status === 200) {
        setMessage('Contraseña actualizada con éxito.');
        setTimeout(() => {
          navigate('/'); // Redirige al login después de 3 segundos
        }, 3000);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
      setError(err.response?.data?.error || 'Token inválido o expirado.');
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
        <button className="submit-btn" type="submit">Actualizar Contraseña</button>

        {/* Mostrar mensajes de éxito o error */}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
