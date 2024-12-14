import { useState }	 from 'react'
import './buscador.css'
// eslint-disable-next-line react/prop-types
function BuscadorCliente({ clientes, formData, setFormData }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
  
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value.toLowerCase());
    };
  
    const handleSelect = (cliente_id, clienteNombre) => {
      setFormData({ ...formData, cliente_id: cliente_id, nombre: clienteNombre }); // Ajusta 'cliente_id' en lugar de 'clienteId'
      setSearchTerm(clienteNombre); // Muestra el nombre seleccionado en el buscador
      setIsOpen(false);
  
    };
  
    // eslint-disable-next-line react/prop-types
    const filteredClientes = clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm)
    );
  
    return (
      <div className="dropdown">
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

export default BuscadorCliente