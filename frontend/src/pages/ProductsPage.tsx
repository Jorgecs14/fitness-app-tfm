import { useState, useEffect } from 'react';
import { ProductForm } from '../components/product.components/ProductForm';
import { ProductList } from '../components/product.components/ProductList';
import * as productService from '../services/productService';
import '../App.css';
import { Product } from '../types/Product';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleSubmit = async (productData: Omit<Product, 'id'>) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
        setEditingProduct(null);
      } else {
        await productService.createProduct(productData);
      }
      loadProducts();
    } catch (error) {
      console.error('Error guardando producto:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productService.deleteProduct(id);
        loadProducts();
      } catch (error) {
        console.error('Error eliminando producto:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div className="app">
      <h1>Gestión de Productos - Entrenador Fitness</h1>
      
      <ProductForm
        onSubmit={handleSubmit}
        productToEdit={editingProduct}
        onCancelEdit={handleCancelEdit}
      />
      
      <ProductList
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};