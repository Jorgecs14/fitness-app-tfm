
import { useState, useEffect, FormEvent } from 'react';
import { Product } from '../../types/Product';

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id'>) => void;
  productToEdit?: Product | null;
  onCancelEdit?: () => void;
}

export const ProductForm = ({ onSubmit, productToEdit, onCancelEdit }: ProductFormProps) => {
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  //const [imagen, setImagen] = useState<string>('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPrice(productToEdit.price);
      setDescription(productToEdit.description);
      //setImagen(productToEdit.imagen);
    } else {
      setName('');
      setPrice(0);
      setDescription('');
      //setImagen('');
    }
  }, [productToEdit]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name.trim() || !price || !description.trim() /*|| !imagen.trim()*/) {
      alert('Por favor completa todos los campos');
      return;
    }

    onSubmit({ name: name, price: price, description: description, /*imagen*/ });
    
    if (!productToEdit) {
      setName('');
      setPrice(0);
      setDescription('');
      //setImagen('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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