import { useState } from 'react';
// eslint-disable-next-line react/prop-types
function ChangePassword({ token, setIsPasswordChanged }) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);

  const changePassword = async () => {
    try {
      const response = await fetch(
        "https://reclamos-production-2298.up.railway.app/changePassword", // Nueva URL
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: newPassword }), // Cuerpo con la nueva contraseña
        }
      );
  
      if (response.ok) {
        setIsPasswordChanged(true); // La contraseña se cambió correctamente
      } else {
        setError("Error al cambiar la contraseña");
        console.error("Error changing password:", response.status);
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };
s 

  return (
    <div className="change-password-container">
      <h2>Por favor, cambia tu contraseña</h2>
      {error && <div>{error}</div>}
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={changePassword}>Cambiar Contraseña</button>
    </div>
  );
}

export default ChangePassword;
