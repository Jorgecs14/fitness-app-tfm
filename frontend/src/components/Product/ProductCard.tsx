import { Product } from '../../types/Product';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  return (
    <div className="client">
      <div className="client-info">
        <h3>{product.nombre}</h3>
        <p><strong>Precio:</strong> {product.precio}</p>
        <p><strong>Descripción:</strong> {product.descripcion}</p>
        <p><strong>Imagen:</strong> {product.imagen}</p>
      </div>
      <div className="client-actions">
        <button onClick={() => onEdit(product)}>Editar</button>
        <button onClick={() => onDelete(product.id)}>Eliminar</button>
      </div>
    </div>
  );
};