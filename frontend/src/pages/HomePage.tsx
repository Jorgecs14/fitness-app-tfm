import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '2rem',
      maxWidth: '450px',
      margin: '0 auto'
    }}>
      <h1>🏋️ Fitness Pro</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        Gestiona tu negocio de entrenamiento personal
      </p>
      
      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        <Link 
          to="/clients" 
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem',
            minWidth: '250px',
          }}
        >
          👥 Ver Clientes
        </Link>
        <Link 
          to="/diets" 
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#2196F3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem',
            minWidth: '250px',
          }}
        >
          🥗 Ver Dietas
        </Link>
        <Link 
          to="/workouts" 
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#FF9800',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem',
            minWidth: '250px',
          }}
        >
          💪 Ver Entrenamientos
        </Link>
        <Link 
          to="/products" 
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#9C27B0',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem',
            minWidth: '250px',
            maxWidth: '250px',
          }}
        >
          🛒 Ecommerce
        </Link>
      </div>
    </div>
  );
};