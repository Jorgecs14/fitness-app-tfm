// Step 1: imports

import { useNavigate } from 'react-router-dom'; // or your routing lib
import { LoginForm } from '../components/auth/LoginForm';

// Step 2: declare component
export const LoginPage = () => {
  const navigate = useNavigate();

  // Step 3: handle successful login
  const handleLoginSuccess = () => {
    alert('Bienvenido al fitnes app lol.');
    navigate('/'); // redirect to dashboard or home page
  };

  // Step 4: render form with success handler prop
  return (
    <div className="login-page">
      <h1>Login to Your Account</h1>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};
