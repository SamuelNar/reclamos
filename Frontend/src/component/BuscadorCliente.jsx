import { useState, useEffect, useRef } from "react";
import "../assets/styles/buscador.css";

// eslint-disable-next-line react/prop-types
function BuscadorCliente({ clientes, formData, setFormData }) {
  // eslint-disable-next-line react/prop-types
  const [searchTerm, setSearchTerm] = useState(formData.nombre || ""); // Mostrar nombre del cliente al editar
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Referencia para manejar clics fuera

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setIsOpen(true); // Abrir menú cuando se escribe algo
  };

  const handleSelect = (cliente_id, clienteNombre) => {  
    setFormData({ ...formData, cliente_id, nombre: clienteNombre });
    setSearchTerm(clienteNombre); // Mostrar el nombre seleccionado
    setIsOpen(false); // Cerrar el menú desplegable
  };

  // Cerrar el menú cuando haces clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtro para buscar clientes
  // eslint-disable-next-line react/prop-types
  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="dropdown" ref={dropdownRef}>
      <input
        type="text"
        placeholder="Buscar cliente..."
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsOpen(true)}
        className="dropdown-input"
      />
      {isOpen && (
        <ul className="dropdown-menu">
          {filteredClientes.length > 0 ? (
            filteredClientes.map((cliente) => (
              <li
                key={cliente.id}
                onClick={() => handleSelect(cliente.id, cliente.nombre)}
                className="dropdown-item"
              >
                {cliente.nombre}
              </li>
            ))
          ) : (
            <li className="dropdown-item">No se encontraron clientes</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default BuscadorCliente;
