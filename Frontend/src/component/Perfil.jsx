import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/perfil.css";
function Perfil() {
  const { id } = useParams(); // Obtiene el id desde la URL
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState({
    cuit: false,
    direccion: false,
    localidad: false,
    provincia: false,
    telefono: false,
    email: false,
  });
  const [formData, setFormData] = useState({    
    nombre: '', 
    cuit: '',
    direccion: '',
    localidad: '',
    provincia: '',
    telefono: '',
    email: '',
  });
  const [originalNombre, setOriginalNombre] = useState(''); 

  useEffect(() => {
    // Función para obtener los datos del perfil
    const fetchPerfil = async () => {
      try {
        const response = await API.get(`/perfil/${id}`);                    
        setPerfil(response.data); // Asumiendo que el perfil es el primer elemento
        setFormData(response.data); // Cargar los datos en el estado para el formulario             
        setOriginalNombre(response.data.nombre);
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
      [name]: value,
    }));
  };

  const handleEditClick = (field) => {
    setEditMode((prevState) => ({
      ...prevState,
      [field]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {             
      const response = await API.put(`/perfil/${id}`, formData);      
      setPerfil(response.data); // Actualiza los datos del perfil con la respuesta
      setFormData(        
         response.data,        
      );     
      setEditMode({
        cuit: false,
        direccion: false,
        localidad: false,
        provincia: false,
        telefono: false,
        email: false,
      }); // Desactiva todos los modos de edición
      alert("Perfil actualizado correctamente");
    } catch (error) {
      alert("Error al actualizar perfil, contactar al administrador");
      setError("Error al actualizar perfil", error);
    }
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!perfil) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div className="perfil-container">
      <button className="perfil-btn" onClick={() => navigate("/")}>Inicio</button>
      <h2 className="perfil-title">Perfil de Usuario</h2>
      <form onSubmit={handleSubmit} className="perfil-form">
        <p className="perfil-field">
          <strong className="perfil-label">Nombre:</strong>
          <span className="perfil-nombre">{originalNombre}</span>
        </p>
        <div className="perfil-field">
          <label>CUIT:</label>
          <div className="perfil-input-container">
            <input
              type="text"
              name="cuit"
              value={formData.cuit}
              disabled={!editMode.cuit}
              onChange={handleInputChange}
              className="perfil-input"
            />
            {!editMode.cuit && (
              <button type="button" onClick={() => handleEditClick('cuit')} className="perfil-edit-btn">
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
          </div>
        </div>
        <div className="perfil-field">
          <label>Dirección:</label>
          <div className="perfil-input-container">
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              disabled={!editMode.direccion}
              onChange={handleInputChange}
              className="perfil-input"
            />
            {!editMode.direccion && (
              <button type="button" onClick={() => handleEditClick('direccion')} className="perfil-edit-btn">
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
          </div>
        </div>
        <div className="perfil-field">
          <label>Localidad:</label>
          <div className="perfil-input-container">
            <input
              type="text"
              name="localidad"
              value={formData.localidad}
              disabled={!editMode.localidad}
              onChange={handleInputChange}
              className="perfil-input"
            />
            {!editMode.localidad && (
              <button type="button" onClick={() => handleEditClick('localidad')} className="perfil-edit-btn">
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
          </div>
        </div>
        <div className="perfil-field">
          <label>Provincia:</label>
          <div className="perfil-input-container">
            <input
              type="text"
              name="provincia"
              value={formData.provincia}
              disabled={!editMode.provincia}
              onChange={handleInputChange}
              className="perfil-input"
            />
            {!editMode.provincia && (
              <button type="button" onClick={() => handleEditClick('provincia')} className="perfil-edit-btn">
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
          </div>
        </div>
        <div className="perfil-field">
          <label>Teléfono:</label>
          <div className="perfil-input-container">
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              disabled={!editMode.telefono}
              onChange={handleInputChange}
              className="perfil-input"
            />
            {!editMode.telefono && (
              <button type="button" onClick={() => handleEditClick('telefono')} className="perfil-edit-btn">
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
          </div>
        </div>
        <div className="perfil-field">
          <label>Email:</label>
          <div className="perfil-input-container">
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled={!editMode.email}
              onChange={handleInputChange}
              className="perfil-input"
            />
            {!editMode.email && (
              <button type="button" onClick={() => handleEditClick('email')} className="perfil-edit-btn">
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
          </div>
        </div>

        <button type="submit" className="perfil-submit-btn">Guardar cambios</button>
      </form>
    </div>
  );
}

export default Perfil;
