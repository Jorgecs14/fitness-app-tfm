
import { useState, useEffect, FormEvent } from 'react';
import { Product } from '../../types/Product';

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id'>) => void;
  productToEdit?: Product | null;
  onCancelEdit?: () => void;
}

export const ProductForm = ({ onSubmit, productToEdit, onCancelEdit }: ProductFormProps) => {
  const [nombre, setNombre] = useState<string>('');
  const [precio, setPrecio] = useState<number>(0);
  const [descripcion, setDescripcion] = useState<string>('');
  //const [imagen, setImagen] = useState<string>('');

  useEffect(() => {
    if (productToEdit) {
      setNombre(productToEdit.nombre);
      setPrecio(productToEdit.precio);
      setDescripcion(productToEdit.descripcion);
      //setImagen(productToEdit.imagen);
    } else {
      setNombre('');
      setPrecio(0);
      setDescripcion('');
      //setImagen('');
    }
  }, [productToEdit]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!nombre.trim() || !precio || !descripcion.trim() /*|| !imagen.trim()*/) {
      alert('Por favor completa todos los campos');
      return;
    }

    onSubmit({ nombre, precio, descripcion, /*imagen*/ });
    
    if (!productToEdit) {
      setNombre('');
      setPrecio(0);
      setDescripcion('');
      //setImagen('');
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
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
      {/* <div className="form-group">
        <input
          type="text"
          placeholder="Imagen URL"
          value={imagen}
          onChange={(e) => setImagen(e.target.value)}
        />
      </div> */}
      <div className="form-buttons">
        <button type="submit">
          {productToEdit ? 'Actualizar' : 'Agregar'} Producto
        </button>
        {productToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};