import { useState, useEffect } from 'react'

function Home() {
  const [reclamos, setReclamos] = useState([])

  useEffect(() => {
    const fetchReclamos = async () => {
      try {
        const response = await fetch('http://localhost:5000/reclamos');
        const data = await response.json();
        setReclamos(data);
      } catch (error) {
        console.error('Error fetching reclamos:', error);
      }
    };
  
    fetchReclamos();
  }, []);

  return (
    <div>
      <h1>Reclamos</h1>
      {reclamos.map((reclamo) => (
        <div key={reclamo.id}>
          <p>Nombre: {reclamo.nombre}</p>
          <p>Producto: {reclamo.producto}</p>
        </div>
      ))}
    </div>
  )
}

export default Home