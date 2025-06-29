//step 1 imports//

import React, { useState } from 'react';
import { signIn } from '../../services/authService';
import './LoginForm.css';

//step 2 interface para que pase una funcion cuando el login va bien, que es opcional pero recomendable//

interface LoginFromProps {
    onLoginSuccess?: () => void;
}

//step 3 declaraciond el componente como tal//

export const LoginForm: React.FC<LoginFromProps> = ({ onLoginSuccess }) => {
  // step 4 declaramos variables//
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

 // step 5 crear las funciones para manejar cuando se somete un form//
 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try{
        await signIn(email, password); //intentar el login con supabase//

        if (onLoginSuccess) onLoginSuccess() //si todo va bien en el login que cargue la respuesta que estaria en la page//
    }   catch(err: any) {   // si hay error que lo pinte//
    
        setError(err.message || 'failed to log in')

    }   finally {
        //quitar el loading//
        setLoading(false)

    }
 };
 

 return ( <div className="form-container">
      <p className="title">Log in</p>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <p className="page-link">
          <span className="page-link-label">Forgot Password?</span>
        </p>

        <button className="form-btn" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        {error && <p className="error">{error}</p>}
      </form>

      <p className="sign-up-label">
        Don’t have an account?
        <span className="sign-up-link">Sign up</span>
      </p>


        {/*<div className="google-login-button">
          <span>🔍 Log in with Google</span>
        </div>*/}
      </div>
    
  );
};
