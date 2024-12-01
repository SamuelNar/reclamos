import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import "./reclamos.css";

// eslint-disable-next-line react/prop-types
const Reclamos = ({ token, onLogout }) => {
  const [reclamos, setReclamos] = useState([]);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await API.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      localStorage.removeItem("token");
      onLogout();      
    }
  }, [token, onLogout]);

  const fetchReclamos = useCallback(async () => {
    try {
      const response = await API.get("/reclamos");
      setReclamos(response.data);
    } catch (err) {
      console.error("Error fetching reclamos:", err);
    }
  }, []);

  const fetchRole = useCallback(() => {
    if (token) {
      try {
        // eslint-disable-next-line react/prop-types
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        if (decodedToken?.rol) {
          setRole(decodedToken.rol);
        } else {
          throw new Error("Rol no encontrado en el token");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        handleLogout();
      }
    }
  }, [token, handleLogout]);

  useEffect(() => {
    fetchReclamos(); // Cargar reclamos sin importar si hay sesión
    if (token) {
      fetchRole(); // Obtener rol si hay token
    }
  }, [token, fetchReclamos, fetchRole]);

  const deleteReclamo = async (id) => {
    try {
      await API.delete(`/reclamos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchReclamos(); // Actualizar la lista después de eliminar
    } catch (err) {
      console.error("Error deleting reclamo:", err);
    }
  };


  return (
    <div className="reclamos-container">
    <div className="header">
      <h1>Reclamos</h1>
      {token ? (
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      ) : (
        <button className="login-button" onClick={() => navigate("/login")}>
          Iniciar Sesión
        </button>
      )}
    </div>

    <div className="reclamos-list">
      {reclamos.map((reclamo) => (
        <div key={reclamo.id} className="reclamo-item">
          <h2>{reclamo.nombre}</h2>
          <p>Estado: {reclamo.estado}</p>
          <p>Producto: {reclamo.producto}</p>
          <p>Asignado: {reclamo.asignado || "No asignado"}</p>
          <p>Importancia: {reclamo.importancia}</p>
          <p>{reclamo.descripcion}</p>
          <p>Fecha: {reclamo.fecha_creacion}</p>

          {token && role === "admin" && (
            <div className="reclamo-actions">
              <button onClick={() => deleteReclamo(reclamo.id)}>Eliminar</button>
              <button onClick={() => navigate(`/reclamos/${reclamo.id}`, { state: { reclamo } })}>
                Editar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>

    {token && role === "admin" && (
      <button className="create-button" onClick={() => navigate("/crear")}>
        Crear Reclamo
      </button>
    )}
  </div>
  );
};

export default Reclamos;
