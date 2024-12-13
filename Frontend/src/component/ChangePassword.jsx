import { useState } from 'react';
import { useParams } from 'react-router-dom'; 
import API from "../utils/api";

// eslint-disable-next-line react/prop-types
function ChangePassword({ token, setIsPasswordChanged }) {
  const { id } = useParams(); 
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);

  const changePassword = async () => {
    if (!newPassword.trim()) {
      setError("La contraseña no puede estar vacía");
      return;
    }
  
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
  
    try {
      console.log("Enviando solicitud para cambiar la contraseña..."); // Agregar log para depurar
      const response = await API.patch(
        `/changePassword/${id}`,  // El id ahora es parte de la URL
        { password: newPassword }, // Solo enviamos la nueva contraseña en el cuerpo
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );    

      console.log("Respuesta de la API:", response);  // Log de la respuesta de la API

      if (response.status === 200) {
        setError(null);
        setIsPasswordChanged(true);  // Actualizar el estado
        alert("Contraseña cambiada con éxito");  // Mostrar mensaje de éxito
      } else {
        setError("Error al cambiar la contraseña. Intente nuevamente.");
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      if (error.response) {
        setError(error.response.data.error || "No se pudo cambiar la contraseña");
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
