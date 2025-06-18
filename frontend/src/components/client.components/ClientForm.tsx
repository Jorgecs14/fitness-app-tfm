import { useState, useEffect, FormEvent } from 'react';
import { Client } from '../../types/Client';

interface ClientFormProps {
  onSubmit: (client: Omit<Client, 'id'>) => void;
  clientToEdit?: Client | null;
  onCancelEdit?: () => void;
}

export const ClientForm = ({ onSubmit, clientToEdit, onCancelEdit }: ClientFormProps) => {
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [objetivo, setObjetivo] = useState<string>('');

  useEffect(() => {
    if (clientToEdit) {
      setNombre(clientToEdit.nombre);
      setEmail(clientToEdit.email);
      setTelefono(clientToEdit.telefono);
      setObjetivo(clientToEdit.objetivo);
    } else {
      setNombre('');
      setEmail('');
      setTelefono('');
      setObjetivo('');
    }
  }, [clientToEdit]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!nombre.trim() || !email.trim() || !telefono.trim() || !objetivo.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    onSubmit({ nombre, email, telefono, objetivo });
    
    if (!clientToEdit) {
      setNombre('');
      setEmail('');
      setTelefono('');
      setObjetivo('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Objetivo (ej: Perder peso, Ganar músculo)"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
        />
      </div>
      <div className="form-buttons">
        <button type="submit">
          {clientToEdit ? 'Actualizar' : 'Agregar'} Cliente
        </button>
        {clientToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};