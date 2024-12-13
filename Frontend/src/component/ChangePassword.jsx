import { useState } from 'react';
import API from "../utils/api";
// eslint-disable-next-line react/prop-types
function ChangePassword({ token, setIsPasswordChanged }) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);

  const changePassword = async () => {
    // Validations
    if (!newPassword.trim()) {
      setError("La contraseña no puede estar vacía");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const response = await API.patch("/changePassword", 
        { password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setError(null);
      }
      setIsPasswordChanged(true);
    } catch (error) {
      console.error("Error changing password:", error);    
   
      if (error.response) {
        setError(
          error.response.data.error || 
          error.response.data.message || 
          "No se pudo cambiar la contraseña"
        );
      } else if (error.request) {
      
        setError("No se recibió respuesta del servidor");
      } else {      
        setError("Error en la configuración de la solicitud");
      }
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2>Cambio de Contraseña</h2>
        <p>Por seguridad, debe cambiar su contraseña predeterminada</p>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="newPassword">Nueva Contraseña</label>
          <input
            id="newPassword"
            type="password"
            placeholder="Ingrese su nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="password-input"
          />
        </div>

        <div className="password-requirements">
          <p>La contraseña debe:</p>
          <ul>
            <li>Tener al menos 6 caracteres</li>
            <li>Incluir letras y números</li>
            <li>No ser una contraseña predeterminada</li>
          </ul>
        </div>

        <button
          onClick={changePassword}
          className="change-password-button"
          disabled={!newPassword.trim()}
        >
          Cambiar Contraseña
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;
