import { useState, useEffect } from "react";
import { useParams} from "react-router-dom";
import API from "../utils/api";

function Perfil() {
  const { id } = useParams(); // Obtiene el id desde la URL
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false); // Estado para manejar el modo de edición
  const [formData, setFormData] = useState({
    nombre: '',
    cuit: '',
    direccion: '',
    localidad: '',
    provincia: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    // Función para obtener los datos del perfil
    const fetchPerfil = async () => {
      try {
        const response = await API.get(`/perfil/${id}`);
        console.log("Respuesta del servidor:", response);
        console.log("Datos recibidos:", response.data);
        setPerfil(response.data); // Asumiendo que el perfil es el primer elemento
        setFormData(response.data); // Cargar los datos en el estado para el formulario
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPerfil();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put(`/perfil/${id}`, formData);
      setPerfil(response.data); // Actualiza los datos del perfil con la respuesta
      setEditMode(false); // Desactiva el modo de edición
    } catch (error) {
      setError("Error al actualizar perfil",error);
    }
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!perfil) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div>
      <h2>Perfil de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <p><strong>Nombre:</strong> {perfil.nombre}</p>
        
        {/* Los demás campos solo se pueden editar si estamos en modo edición */}
        <div>
          <label>CUIT:</label>
          <input
            type="text"
            name="cuit"
            value={formData.cuit}
            disabled={!editMode} // Deshabilitar si no estamos en modo edición
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Dirección:</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            disabled={!editMode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Localidad:</label>
          <input
            type="text"
            name="localidad"
            value={formData.localidad}
            disabled={!editMode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Provincia:</label>
          <input
            type="text"
            name="provincia"
            value={formData.provincia}
            disabled={!editMode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            disabled={!editMode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled={!editMode}
            onChange={handleInputChange}
          />
        </div>
        
        {editMode ? (
          <button type="submit">Guardar cambios</button>
        ) : (
          <button type="button" onClick={() => setEditMode(true)}>Editar Perfil</button>
        )}
      </form>
    </div>
  );
}

export default Perfil;
