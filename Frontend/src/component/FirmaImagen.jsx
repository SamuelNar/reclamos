import { useState, useEffect } from 'react';

// eslint-disable-next-line react/prop-types
function FirmaImagen({ clientId }) {
  const [firma, setFirma] = useState(null);
  useEffect(() => {
    const fetchFirma = async () => {
      try {
        const response = await fetch(`/reclamos/firma/${clientId}`);     
        console.log(response);  
        if (response.ok) {
          const imageUrl = URL.createObjectURL(await response.blob());
          setFirma(imageUrl);
        } else {
          console.error("Ni idea");
        }
      } catch (error) {
        console.error("Error al obtener la firma:", error);
      }
    };

    fetchFirma();
  }, [clientId]);

  if (!firma) {
    return <p>Cargando firma...</p>;
  }

  return (
    <div>
      <h2>Firma</h2>
      <img src={firma} alt="Firma" />
    </div>
  );
}

export default FirmaImagen;
