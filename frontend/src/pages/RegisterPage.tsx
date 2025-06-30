import { User } from "../types/User";
import { UserForm } from "../components/User/UserForm";
import * as userService from "../services/userService";
import "../App.css";
import { useNavigate } from "react-router-dom";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const handleSubmit = async (userData: Omit<User, "id" | "created_at">) => {
    try {
      await userService.createUser(userData);
      window.alert("Usuario creado correctamente");
      navigate("/"); 
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
  };

  return (
    <div className="app">
      <h1>Registro de Usuario</h1>

      <UserForm onSubmit={handleSubmit} />
    </div>
  );
};
