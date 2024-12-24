import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
function Perfil() {    
    const { id } = useParams(); // Obtiene el id desde la URL
    const navigate = useNavigate(); // Para redirigir a otra ruta
    const [perfil, setPerfil] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Función para obtener los datos del perfil
        const fetchPerfil = async () => {
          try {
            const response = await fetch(`/reclamos/perfil/${id}`);
            if (!response.ok) {
              throw new Error("Error al obtener el perfil");
            }
            const data = await response.json();
            setPerfil(data[0]); // Asumiendo que el perfil es el primer elemento
          } catch (error) {
            setError(error.message);
          }
        };
    
        fetchPerfil();
      }, [id]);
    
      if (error) {
        return <p>Error: {error}</p>;
      }
    
      if (!perfil) {
        return <p>Cargando perfil...</p>;
      }
    
    

      return (
        <div>
          <h2>Perfil de Usuario</h2>
          <p><strong>Nombre:</strong> {perfil.nombre}</p>
          <p><strong>CUIT:</strong> {perfil.cuit}</p>
          <p><strong>Dirección:</strong> {perfil.direccion}</p>
          <p><strong>Localidad:</strong> {perfil.localidad}</p>
          <p><strong>Provincia:</strong> {perfil.provincia}</p>
          <p><strong>Teléfono:</strong> {perfil.telefono}</p>
          <p><strong>Email:</strong> {perfil.email}</p>
    
          <button onClick={() => navigate(`/reclamos/perfil/${id}/editar`)}>Editar Perfil</button>
        </div>
      );
    
}

export default Perfil