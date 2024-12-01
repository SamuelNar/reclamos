import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Elimina el token del almacenamiento
    localStorage.removeItem('token');
    // Opcional: podrías llamar al endpoint /auth/logout si es necesario
    navigate('/'); // Redirige al usuario a la página de inicio de sesión
  };

  return (
    <button onClick={handleLogout}>
      Cerrar Sesión
    </button>
  );
};

export default LogoutButton;