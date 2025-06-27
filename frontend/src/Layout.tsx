import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

export const Layout = () => {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-brand">💪 Fitness Pro</Link>
        <div className="nav-links">
          <Link to="/">🏠 Inicio</Link>
          <Link to="/users">👥 Usuarios</Link>
          <Link to="/diets">🥐 Dietas </Link>
          <Link to="/workouts">🏋️ Entrenamientos </Link>
          <Link to="/products">🛒 Productos </Link>
        </div>
      </nav>
      
      <Outlet />
    </>
  );
};

