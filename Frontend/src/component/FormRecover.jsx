import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import '../assets/styles/recover.css';

function FormRecover() {    
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await API.post('/password-request', { email }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',  // Permitir cualquier origen
                }
              });           
            {
                   /* API.post('/password-request', { email })
                     if (response.status === 200) {
                setMessage('Si el email está registrado, se ha enviado un enlace de recuperación.');
                setTimeout(() => {
                    navigate('/'); // Redirige al usuario al login después de 5 segundos
                  }, 5000);
              } else {
                setError('Ocurrió un error inesperado, por favor intenta de nuevo.');
              }
                */
            }  
            setMessage(response.data.message);  
            setTimeout(() => {
                navigate('/login'); // Redirige al usuario al login después de 5 segundos
              }, 5000);       
        } catch (err) {
            console.error('Error en la recuperación de contraseña:', err);
            setError(err.response?.data?.error || 'Ocurrió un error, por favor intenta de nuevo.');
        }
    };

    return (
        <div className="forgot-password-container">
            <form onSubmit={handleSubmit}>
                <h2>Recuperar Contraseña</h2>
                <p>Introduce tu correo electrónico para recibir un enlace de recuperación.</p>
                <div className="form-group">
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                        className="input-field"
                        id="email"
                        type="email"
                        placeholder="Ingresa tu correo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button className="submit-btn" type="submit">Enviar Enlace</button>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}

export default FormRecover