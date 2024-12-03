import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSyncAlt,
  faTrashAlt,
  faEdit,
  faSave,
  faTimes,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { format } from "date-fns";
import "./reclamos.css";

// eslint-disable-next-line react/prop-types
const Reclamos = ({ token, onLogout }) => {
  const [reclamos, setReclamos] = useState([]);
  const [role, setRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingObservaciones, setEditingObservaciones] = useState(null);
  const [tempObservaciones, setTempObservaciones] = useState("");
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
      setRole("");
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
    } else {
      setRole("");
    }
  }, [token, fetchReclamos, fetchRole]);

  const deleteReclamo = async (id) => {
    try {
      await API.put(
        `/reclamos/${id}/eliminar`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
    };
    const newStatus = statusProgression[currentStatus] || "inactivo";
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
      fetchReclamos();
    } catch (err) {
      console.error("Error changing reclamo status:", err);
    }
  };

  const updateObservaciones = async (id) => {
    try {
      await API.patch(
        `/reclamos/${id}/observaciones`,
        { observaciones: tempObservaciones },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchReclamos();
      setEditingObservaciones(null);
    } catch (err) {
      console.error("Error updating observaciones:", err);
    }
  };

  const startEditObservaciones = (reclamo) => {
    setEditingObservaciones(reclamo.id);
    setTempObservaciones(reclamo.observaciones || "");
  };

  const cancelEditObservaciones = () => {
    setEditingObservaciones(null);
    setTempObservaciones("");
  };

  const filteredReclamos = reclamos.filter((reclamo) => {
    // Filtro por estado
    if (selectedStatus && reclamo.estado !== selectedStatus) {
      return false;
    }
    if (selectedStatus === "eliminado" && reclamo.estado !== "eliminado") {
      return false;
    }

    // Filtro por búsqueda de nombre
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return reclamo.nombre.toLowerCase().includes(searchTermLower);
    }

    return true;
  });

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

      <div className="filters">
        <div className="status-filter">
          <label>Filtrar por estado:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="inactivo">Inactivo</option>
            <option value="activo">Activo</option>
            <option value="en proceso">En Proceso</option>
            <option value="finalizado">Finalizado</option>
            <option value="eliminado">Eliminado</option>
          </select>
        </div>

        <div className="search-filter">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>
      </div>

      <div className="reclamos-list">
        {filteredReclamos.length > 0 ? (
          filteredReclamos.map((reclamo) => (
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
              <div className="observaciones-container">
                <p>
                  Observaciones:{" "}
                  <span>
                    {editingObservaciones === reclamo.id ? (
                      <div className="edit-observaciones">
                        <textarea
                          value={tempObservaciones}
                          onChange={(e) => setTempObservaciones(e.target.value)}
                          className="observaciones-textarea"
                        />
                        <div className="observaciones-edit-buttons">
                          <button
                            onClick={() => updateObservaciones(reclamo.id)}
                            className="save-button"
                          >
                            <FontAwesomeIcon icon={faSave} /> Guardar
                          </button>
                          <button
                            onClick={cancelEditObservaciones}
                            className="cancel-button"
                          >
                            <FontAwesomeIcon icon={faTimes} /> Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {reclamo.observaciones}
                        {(reclamo.estado === "en proceso" ||
                          reclamo.estado === "finalizado") && (
                          <button
                            onClick={() => startEditObservaciones(reclamo)}
                            className="edit-observaciones-button"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                      </>
                    )}
                  </span>
                </p>
              </div>
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
