import { useState, useEffect, useCallback, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
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
  const [signatures, setSignatures] = useState({}); // Para almacenar firmas por reclamo
  const signaturePads = useRef({});  // Referencias para cada firma
 
  const navigate = useNavigate();
  const handleLogout = useCallback(async () => {
    try {
      // Decodificar el token para verificar la contraseña

      // Cerrar sesión en el backend
      await API.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Procedimiento normal de logout
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setRole("");
      onLogout();
      navigate("/login");

    } catch (err) {
      console.error("Error en logout:", err);
      // Logout normal en caso de error
      localStorage.removeItem("token");
      setRole("");
      onLogout();
      navigate("/login");
    }
  }, [token, onLogout, navigate]);


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

  const fetchReclamos = useCallback(async () => {
    try {
      let response
      if (role === 'admin' || role === 'tecnico') {
        response = await API.get('/reclamos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReclamos(response.data);
      } else if (role === 'cliente') {
        // eslint-disable-next-line react/prop-types
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.id;
        response = await API.get(`/reclamos/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        //const reclamosData = Array.isArray(response.data) ? response.data : [response.data];
        setReclamos(response.data);
      }
    } catch (err) {
      console.error("Error fetching reclamos:", err);
    }
  }, [role, token]);


  useEffect(() => {
    if (token) {
      fetchRole();
    } else {
      setRole("");
    }
  }, [token, fetchRole]);

  useEffect(() => {
    if (role) {
      fetchReclamos();
    }
  }, [role, token, fetchReclamos]);

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
    if (newStatus === "finalizado" && !signatures[id]) {
      alert("Debe firmar antes de finalizar el reclamo.");
      return;
    }

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
      await API.put(
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

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (reclamo.nombre && reclamo.nombre.toLowerCase().includes(searchTermLower)) ||
        (reclamo.importancia && reclamo.importancia.toLowerCase().includes(searchTermLower)) ||
        (reclamo.producto && reclamo.producto.toLowerCase().includes(searchTermLower)) ||
        (reclamo.sector && reclamo.sector.toLowerCase().includes(searchTermLower)) ||
        (reclamo.asignado && reclamo.asignado.toLowerCase().includes(searchTermLower))
      );
    }    
    return true;
  });

  const saveSignature = async (id) => {
    try {
      const signatureData = signaturePads.current[id].toDataURL();
      await API.put(
        `/reclamos/${id}/firma`,
        { firma: signatureData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await API.patch(
        `/reclamos/${id}/estado`,
        { estado: "finalizado" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSignatures((prev) => ({
        ...prev,
        [id]: signatureData,
      }));

      // Refresh the reclamos list to reflect the new status
      fetchReclamos();
    } catch (err) {
      console.error("Error saving signature:", err);
    }
  };

  const clearSignature = (id) => {
    signaturePads.current[id].clear();
    setSignatures((prev) => ({
      ...prev,
      [id]: null,  // Resetea la firma guardada para el reclamo
    }));
  };


  const renderReclamoActions = (reclamo) => {
    if (role === "admin") {
      return (               
     
        <div className="reclamo-actions">
          <div>
          {reclamo.estado !== "finalizado" && reclamo.estado !== "eliminado" && (
          <button
            className="change-status-button"
            onClick={() => changeReclamoStatus(reclamo.id, reclamo.estado)}
          >
            <FontAwesomeIcon icon={faSyncAlt} /> Cambiar Estado
          </button>
        )}
          </div>           
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
      );
    }

    if (role === 'tecnico') {
      return (
        <div className="reclamo-actions">
          {reclamo.estado !== "finalizado" && reclamo.estado !== "eliminado" && (
            <button
              className="change-status-button"
              onClick={() => changeReclamoStatus(reclamo.id, reclamo.estado)}
            >
              <FontAwesomeIcon icon={faSyncAlt} /> Cambiar Estado
            </button>
          )}
        </div>
      );
    }

    if (role === 'cliente') {
      return (
        reclamo.estado === "en proceso" && (
          <div className="signature-container">
            <h3>Firma Virtual</h3>
            <SignatureCanvas
              ref={(ref) => (signaturePads.current[reclamo.id] = ref)}
              backgroundColor="white"
              penColor="black"
              canvasWidth={500}
              canvasHeight={200}
            />
            <div className="signature-buttons">
              <button onClick={() => saveSignature(reclamo.id)}>
                Guardar Firma
              </button>
              <button onClick={() => clearSignature(reclamo.id)}>
                Limpiar Firma
              </button>
            </div>
            {signatures[reclamo.id] && (
              <div className="signature-preview">
                <h4>Firma Guardada:</h4>
                <img src={signatures[reclamo.id]} alt="Firma" />
              </div>
            )}
          </div>
        )
      );
    }
    return null
  }


  return (
    <div className="reclamos-container">
      <div className="header">
        <h1>Reclamos LiderCom</h1>
        {token ? (
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        ) : (
          <button className="login-button" onClick={() => navigate("/login")}>
            Iniciar Sesión
          </button>
        )}  
        <button className="" onClick={() => navigate("/perfil/:id")}>
          Perfil  
        </button>      
      </div>
      {(token && (role === "cliente" || role === "admin")) && (
        <button className="create-button" onClick={() => navigate("/crear")}>
          Crear Reclamo
        </button>
        )}
      {(role === 'admin' || role === 'tecnico' || role === 'cliente') && (
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
      )}

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
              <p>Sector: {reclamo.sector || "No asignado"}</p>          
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
              {renderReclamoActions(reclamo)}                     
            </div>
          ))
        ) : (
          <div className="no-reclamos">
            <p>No hay reclamos registrados</p>
          </div>
        )}
      </div>      
    </div>
  );
};

export default Reclamos;