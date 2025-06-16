import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

export const Layout = () => {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-brand">💪 Fitness Pro</Link>
        <div className="nav-links">
          <Link to="/">🏠 Inicio</Link>
          <Link to="/clients">👥 Clientes</Link>
          <Link to="/products">🛒 Venta</Link>
        </div>
      </nav>
      
      <Outlet />
    </>
  );
};