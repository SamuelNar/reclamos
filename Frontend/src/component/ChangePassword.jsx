import { useState } from 'react';
// eslint-disable-next-line react/prop-types
function ChangePassword({ token, setIsPasswordChanged }) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const changePassword = async () => {
    // Validar que la contraseña no esté vacía y cumpla requisitos
    if (!newPassword.trim()) {
      setError("La contraseña no puede estar vacía");
      return;
    }
  
    // Opcional: Agregar validaciones de complejidad
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
  
    try {
      const response = await fetch(
        "https://reclamos-production-2298.up.railway.app/changePassword",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );
  
      if (response.ok) {
        // Cuando se cambia con éxito
        setIsPasswordChanged(true);
        // Opcional: Navegar al home o mostrar mensaje de éxito
      } else {
        // Manejo de errores del servidor
        const errorData = await response.json();
        setError(errorData.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError("No se pudo conectar con el servidor");
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
