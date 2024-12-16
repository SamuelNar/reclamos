import { useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import "./ChangePassword.css";
// eslint-disable-next-line react/prop-types
function ChangePassword({ token, setIsPasswordChanged }) {
  let { id } = useParams();

  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    hasNumber: false,
    hasLetter: false,
  });
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
    };
    setPasswordValidations(validations);
    return Object.values(validations).every(Boolean);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePassword(value);
  };

  // eslint-disable-next-line react/prop-types
  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  id = decodedToken.id;

  const changePassword = async () => {
    if (!validatePassword(newPassword)) {
      setError("La contraseña no cumple con los requisitos");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const response = await API.patch(
        `/changePassword/${id}`, // El id ahora es parte de la URL
        { password: newPassword }, // Solo enviamos la nueva contraseña en el cuerpo
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setError(null);
        setIsPasswordChanged(true); // Actualizar el estado
        alert("Contraseña cambiada con éxito"); // Mostrar mensaje de éxito
      } else {
        setError("Error al cambiar la contraseña. Intente nuevamente.");
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      if (error.response) {
        setError(
          error.response.data.error || "No se pudo cambiar la contraseña"
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
        <h2 className="h2-password">Cambio de Contraseña</h2>
        <p className="p-password">
          Por seguridad, debe cambiar su contraseña predeterminada
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="newPassword">Nueva Contraseña</label>
          <input
            id="newPassword"
            type="password"
            placeholder="Ingrese su nueva contraseña"
            value={newPassword}
            onChange={handlePasswordChange}
            className="password-input"
          />
        </div>

        <div className="password-requirements">
          <p>La contraseña debe:</p>
          <ul>
            <li style={{ color: passwordValidations.length ? "green" : "red" }}>
              Tener al menos 6 caracteres
            </li>
            <li
              style={{ color: passwordValidations.hasLetter ? "green" : "red" }}
            >
              Incluir al menos una letra
            </li>
            <li
              style={{ color: passwordValidations.hasNumber ? "green" : "red" }}
            >
              Incluir al menos un número
            </li>
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
