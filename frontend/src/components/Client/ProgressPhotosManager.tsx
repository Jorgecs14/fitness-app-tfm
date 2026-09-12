import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Input,
  Chip
} from '@mui/material';
import { Iconify } from '../../utils/iconify';
import { ClientProgressPhoto, CreateClientProgressPhotoData, PHOTO_TYPES } from '../../types/ClientProgressPhoto';
import { clientProgressPhotoService } from '../../services/clientProgressPhotoService';

interface ProgressPhotosManagerProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  photoDate: string;
  onSave: () => void;
}

const ProgressPhotosManager: React.FC<ProgressPhotosManagerProps> = ({
  open,
  onClose,
  userId,
  photoDate,
  onSave
}) => {
  const [photos, setPhotos] = useState<ClientProgressPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId && photoDate) {
      loadPhotos();
    }
  }, [open, userId, photoDate]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await clientProgressPhotoService.getByUserIdAndDate(userId, photoDate);
      setPhotos(data);
    } catch (error: any) {
      console.error('Error al cargar fotos de progreso:', error);
      setError('Error al cargar las fotos de progreso');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (photoType: 'front_arms_cross' | 'side_arms_front' | 'back_arms_cross', file: File) => {
    try {
      setUploading(photoType);
      setError(null);

      // Subir archivo
      const uploadResult = await clientProgressPhotoService.uploadPhoto(file);
      
      // Verificar si ya existe una foto de este tipo para esta fecha
      const existingPhoto = photos.find(p => p.photo_type === photoType);
      
      if (existingPhoto) {
        // Eliminar la foto existente
        await clientProgressPhotoService.delete(existingPhoto.id);
      }

      // Crear nueva foto
      const photoData: CreateClientProgressPhotoData = {
        user_id: userId,
        photo_type: photoType,
        photo_url: uploadResult.url,
        photo_date: photoDate
      };

      await clientProgressPhotoService.create(photoData);
      
      // Recargar fotos
      await loadPhotos();
      
    } catch (error: any) {
      console.error('Error al subir foto:', error);
      setError('Error al subir la foto');
    } finally {
      setUploading(null);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await clientProgressPhotoService.delete(photoId);
      await loadPhotos();
    } catch (error: any) {
      console.error('Error al eliminar foto:', error);
      setError('Error al eliminar la foto');
    }
  };

  const getPhotoByType = (photoType: string) => {
    return photos.find(p => p.photo_type === photoType);
  };

  const handleClose = () => {
    setPhotos([]);
    setError(null);
    onClose();
  };

  const handleSave = () => {
    onSave();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Fotos de Progreso - {new Date(photoDate).toLocaleDateString('es-ES')}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sube las fotos de progreso para esta fecha. Se recomienda usar la misma iluminación y posición para todas las sesiones.
          </Typography>

          <Grid container spacing={3}>
            {PHOTO_TYPES.map((photoType) => {
              const existingPhoto = getPhotoByType(photoType.key);
              const isUploading = uploading === photoType.key;

              return (
                <Grid item xs={12} md={4} key={photoType.key}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {photoType.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {photoType.description}
                      </Typography>

                      {existingPhoto ? (
                        <Box>
                          <CardMedia
                            component="img"
                            height="200"
                            image={existingPhoto.photo_url}
                            alt={photoType.label}
                            sx={{ mb: 2, objectFit: 'cover' }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip label="Completado" color="success" size="small" />
                            <Button
                              size="small"
                              color="error"
                              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                              onClick={() => handleDeletePhoto(existingPhoto.id)}
                            >
                              Eliminar
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <Box
                            sx={{
                              height: 200,
                              border: '2px dashed #ccc',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 2,
                              backgroundColor: '#f9f9f9'
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Sin foto
                            </Typography>
                          </Box>
                          
                          <Input
                            accept="image/*"
                            id={`photo-upload-${photoType.key}`}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handlePhotoUpload(photoType.key, file);
                              }
                            }}
                          />
                          <label htmlFor={`photo-upload-${photoType.key}`}>
                            <Button
                              variant="outlined"
                              component="span"
                              fullWidth
                              startIcon={<Iconify icon="solar:camera-bold" />}
                              disabled={isUploading}
                            >
                              {isUploading ? 'Subiendo...' : 'Subir Foto'}
                            </Button>
                          </label>
                        </Box>
                      )}

                      {/* Botón para reemplazar foto existente */}
                      {existingPhoto && (
                        <Box sx={{ mt: 2 }}>
                          <Input
                            accept="image/*"
                            id={`photo-replace-${photoType.key}`}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handlePhotoUpload(photoType.key, file);
                              }
                            }}
                          />
                          <label htmlFor={`photo-replace-${photoType.key}`}>
                            <Button
                              variant="text"
                              component="span"
                              size="small"
                              fullWidth
                              startIcon={<Iconify icon="solar:camera-bold" />}
                              disabled={isUploading}
                            >
                              {isUploading ? 'Reemplazando...' : 'Reemplazar Foto'}
                            </Button>
                          </label>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {photos.length > 0 && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Progreso:</strong> {photos.length} de {PHOTO_TYPES.length} fotos completadas
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cerrar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgressPhotosManager;
