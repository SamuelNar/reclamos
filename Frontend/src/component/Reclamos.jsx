import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSyncAlt,
  faTrashAlt,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { format } from "date-fns";
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
    fetchReclamos();
    if (token) {
      fetchRole();
    }
  }, [token, fetchReclamos, fetchRole]);

  const deleteReclamo = async (id) => {
    try {
      await API.delete(`/reclamos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchReclamos();
    } catch (err) {
      console.error("Error deleting reclamo:", err);
    }
  };

  const changeReclamoStatus = async (id, currentStatus) => {
    const statusProgression = {
      inactivo: "activo",
      activo: "en proceso",
      "en proceso": "finalizado",
      finalizado: "eliminado",
    };
    const newStatus = statusProgression[currentStatus] || "Inactivo";
    try {
      await API.patch(
        `/reclamos/${id}/estado`,
        { estado: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh the reclamos list
      fetchReclamos();
    } catch (err) {
      console.error("Error changing reclamo status:", err);
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
        {reclamos.length > 0 ? (
          reclamos.map((reclamo) => (
            <div
              key={reclamo.id}
              className="reclamo-item"
              data-importancia={reclamo.importancia.toLowerCase()}
            >
              <h2>{reclamo.nombre}</h2>
              <p>Estado: {reclamo.estado}</p>
              <p>Producto: {reclamo.producto}</p>
              <p>Asignado: {reclamo.asignado || "No asignado"}</p>
              <p>Importancia: {reclamo.importancia}</p>
              <p>{reclamo.descripcion}</p>
              <p>
                Fecha:{" "}
                {format(new Date(reclamo.fecha_creacion), "dd/MM/yyyy HH:mm")}
              </p>

              <div className="reclamo-status-actions">
                <button
                  className="change-status-button"
                  onClick={() =>
                    changeReclamoStatus(reclamo.id, reclamo.estado)
                  }
                >
                  <FontAwesomeIcon icon={faSyncAlt} /> Cambiar Estado
                </button>
                {role === "admin" && (
                  <div className="reclamo-actions">
                    <button onClick={() => deleteReclamo(reclamo.id)}>
                      <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/reclamos/${reclamo.id}`, {
                          state: { reclamo },
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faEdit} /> Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-reclamos">
            <p>No hay reclamos registrados</p>
          </div>
        )}
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
