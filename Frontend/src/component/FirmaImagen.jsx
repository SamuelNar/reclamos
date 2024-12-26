import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import API from '../utils/api';

function FirmaImagen() {
  const { cliente_id } = useParams(); // Obtiene el id desde la URL
  const [firmas, setFirmas] = useState([]); // Manejar múltiples firmas
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error

  useEffect(() => {
    const fetchFirmas = async () => {
      try {
        const response = await API.get(`/reclamos/firma/${cliente_id}`);
        console.log(response);
        if (response.status === 200) {
          const data = await response.json(); // Obtener JSON desde la respuesta
          setFirmas(data.firmas || []); // Establecer las firmas
        } else {
          setError("No se pudieron cargar las firmas.");
        }
      } catch (error) {
        console.error("Error al obtener las firmas:", error);
        setError("Hubo un error al cargar las firmas.");
      } finally {
        setLoading(false); // Terminar el estado de carga
      }
    };

    fetchFirmas();
  }, [cliente_id]);

  if (loading) {
    return <p>Cargando firmas...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (firmas.length === 0) {
    return <p>No hay firmas disponibles.</p>;
  }

  return (
    <div>
      <h2>Firmas</h2>
      <div>
        {firmas.map((firma, index) => (
          <img key={index} src={firma} alt={`Firma ${index + 1}`} style={{ margin: '10px', maxWidth: '100%' }} />
        ))}
      </div>
    </div>
  );
}

export default FirmaImagen;