/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const FirmaVirtual = ({ reclamo, saveSignature, clearSignature, signatures }) => {
    const signaturePads = useRef({});
    const [canvasDimensions, setCanvasDimensions] = useState({
        width: 500,  // Ancho inicial pequeño
        height: 150, // Alto inicial pequeño
    });

    // Ajustar las dimensiones del lienzo según el tamaño de la pantalla
    useEffect(() => {
        const updateCanvasDimensions = () => {
            // Establecer el ancho y alto en porcentaje de la pantalla, con un límite máximo
            const width = window.innerWidth * 0.8;  // 80% del ancho de la pantalla
            const height = window.innerHeight * 0.25; // 25% de la altura de la pantalla
            const maxWidth = 400;
            const maxHeight = 200;

            setCanvasDimensions({
                width: Math.min(width, maxWidth),
                height: Math.min(height, maxHeight),
            });
        };

        // Llamar a la función al cargar la página y cada vez que cambia el tamaño de la ventana
        window.addEventListener('resize', updateCanvasDimensions);
        updateCanvasDimensions();

        return () => {
            window.removeEventListener('resize', updateCanvasDimensions);
        };
    }, []);

    return (
        reclamo.estado === "en proceso" && (
            <div className="signature-container">
                <h3>Firma Virtual</h3>
                <SignatureCanvas
                    ref={(ref) => (signaturePads.current[reclamo.id] = ref)}
                    backgroundColor="white"
                    penColor="black"
                    canvasWidth={canvasDimensions.width}
                    canvasHeight={canvasDimensions.height}
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
};

export default FirmaVirtual;
