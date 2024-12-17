import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./crearReclamo.css";
import BuscadorCliente from "./BuscadorCliente";

function CrearReclamo() {
  const navigate = useNavigate();
  const location = useLocation();
  const reclamo = location.state?.reclamo || null;
  const [formData, setFormData] = useState({
    nombre: reclamo?.nombre || "", // Siempre debe ser un string
    producto: reclamo?.producto || "",
    productoPersonalizado: "",
    descripcion: reclamo?.descripcion || "",
    descripcionPersonalizada: "",
    importancia: reclamo?.importancia || "",
    estado: reclamo?.estado || "",
    observaciones: reclamo?.observaciones || "Ingrese observaciones",
    asignado: reclamo?.asignado || "",
    cliente_id: reclamo?.cliente_id || "",
  });

  const [clientes, setClientes] = useState([]); // Lista de clientes
  const [descripcionOpciones, setDescripcionOpciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userRole, setUserRole] = useState("");
  useEffect(() => {
    const fetchClientes = async () => {
      const token = localStorage.getItem("token");
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserRole(decodedToken.rol);
      if (decodedToken.rol === "cliente") {
        try {
          const response = await fetch(
            `https://reclamos-production-2298.up.railway.app/clientes/${decodedToken.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const cliente = await response.json();
          const clienteData = cliente[0];
          setFormData((prev) => ({
            ...prev,
            nombre: clienteData.nombre,
            cliente_id: clienteData.id,
          }));         
        } catch (error) {
          console.log(error)
        }
      } else {
        try {
          const response = await fetch(
            "https://reclamos-production-2298.up.railway.app/clientes",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Error al obtener la lista de clientes");
          }
          const data = await response.json();
          setClientes(data);
        } catch (error) {
          setError("No se pudo cargar la lista de clientes.", error);
        }
      }
    };
    fetchClientes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "producto") {
      if (value === "camara") {
        setDescripcionOpciones(["Lente roto", "No enfoca"]);
      } else if (value === "internet") {
        setDescripcionOpciones(["Velocidad baja", "Sin conexión"]);
      } else if (value === "telecomunicaciones") {
        setDescripcionOpciones(["Línea caída", "Interferencia"]);
      } else {
        setDescripcionOpciones([]);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const reclamoData = {
      ...formData,
      producto:
        formData.producto === "otros"
          ? formData.productoPersonalizado
          : formData.producto,
      descripcion:
        formData.descripcion === "otros"
          ? formData.descripcionPersonalizada
          : formData.descripcion,
      observaciones: formData.observaciones || "Ingrese observaciones",
    };

    try {
      const token = localStorage.getItem("token");
      const method = reclamo ? "PUT" : "POST";
      const endpoint = reclamo
        ? `https://reclamos-production-2298.up.railway.app/reclamos/${reclamo.id}`
        : "https://reclamos-production-2298.up.railway.app/reclamos";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reclamoData),        
      });
      console.log(reclamoData);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.error || "Error al procesar el reclamo");
      }

      // Éxito: Mostrar mensaje y redirigir
      setSuccess(
        reclamo ? "Reclamo actualizado con éxito" : "Reclamo creado con éxito"
      );
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      // Mostrar error detallado
      setError(error.message || "Hubo un problema al procesar el reclamo");
    } finally {
      setLoading(false);
    }
  };

  const handleHome = () => {
    navigate("/");
  }

  return (
    <div className="container">
      <div className="form-wrapper">
        <button onClick={handleHome} className="home_button">Inicio</button>
        <h2 className="text_reclamos">
          {reclamo ? "Editar Reclamo" : "Crear Reclamo"}
        </h2>
        <form onSubmit={handleSubmit} className="form_reclamos_create">
          {userRole === "cliente" ? (
            <input
              type="text"
              value={formData.nombre}
              readOnly
              placeholder="Nombre del cliente no disponible"
              className="readonly-input"
            />
          ) : (
            <BuscadorCliente
              clientes={clientes}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          <select
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar Producto</option>
            <option value="camara">Cámara</option>
            <option value="internet">Internet</option>
            <option value="telecomunicaciones">Telecomunicaciones</option>
            <option value="otros">Otros</option>
          </select>

          {formData.producto === "otros" && (
            <input
              name="productoPersonalizado"
              placeholder="Producto Personalizado"
              value={formData.productoPersonalizado}
              onChange={handleChange}
              required
            />
          )}

          {(descripcionOpciones.length > 0 || formData.producto === "otros") && (
            <select
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar Descripción</option>
              {descripcionOpciones.length > 0 &&
                descripcionOpciones.map((opcion, index) => (
                  <option key={index} value={opcion}>
                    {opcion}
                  </option>
                ))}
              <option value="otros">Otros</option>
            </select>
          )}

          {formData.descripcion === "otros" && (
            <textarea
              name="descripcionPersonalizada"
              placeholder="Descripción Personalizada"
              value={formData.descripcionPersonalizada}
              onChange={handleChange}
              required
            />
          )}

          <select
            name="importancia"
            value={formData.importancia}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar Importancia</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar Estado</option>
            <option value="inactivo">Inactivo</option>
            <option value="activo">Activo</option>
            <option value="en proceso">En Proceso</option>
            <option value="finalizado">Finalizado</option>
            <option value="eliminado">Eliminado</option>
          </select>
          {/*
              {reclamo && (
            <select
              name="asignado"
              value={formData.asignado}
              onChange={handleChange}
              required
            >
              <option value="">Asignar a</option>
              <option value="Samuel">Samuel</option>
              <option value="Maxi">Maxi</option>
              <option value="Joel">Joel</option>
              <option value="Agustin">Agustin</option>
              <option value="Silvio">Silvio</option>
              <option value="Gabriel">Gabriel</option>
              <option value="Agustin b">Agustin b</option>
              <option value="Matias">Matias</option>
            </select>
          )}
          */}          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            className="button_create"
            disabled={loading}
          >
            {loading
              ? "Enviando..."
              : reclamo
                ? "Guardar Cambios"
                : "Crear Reclamo"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CrearReclamo;