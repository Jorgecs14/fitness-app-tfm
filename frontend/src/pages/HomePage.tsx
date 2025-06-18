import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '2rem',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>🏋️ Fitness Pro</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        Gestiona tu negocio de entrenamiento personal
      </p>
      
      <div style={{ marginTop: '3rem' }}>
        <Link 
          to="/clients" 
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem'
          }}
        >
          👥 Ver Clientes
        </Link>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Link 
          to="/products" 
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem'
          }}
        >
          🛒 Venta
        </Link>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Link 
          to="/workouts" 
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem'
          }}
        >
          🦾 Entrenamientos
        </Link>
      </div>
    </div>
  );
};