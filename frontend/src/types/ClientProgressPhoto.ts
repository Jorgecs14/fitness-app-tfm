export interface ClientProgressPhoto {
  id: number;
  user_id: number;
  photo_type: 'front_arms_cross' | 'side_arms_front' | 'back_arms_cross';
  photo_url: string;
  photo_date: string;
  created_at: string;
}

export interface CreateClientProgressPhotoData {
  user_id: number;
  photo_type: 'front_arms_cross' | 'side_arms_front' | 'back_arms_cross';
  photo_url: string;
  photo_date: string;
}

export type PhotoType = {
  key: 'front_arms_cross' | 'side_arms_front' | 'back_arms_cross';
  label: string;
  description: string;
};

export const PHOTO_TYPES: PhotoType[] = [
  {
    key: 'front_arms_cross',
    label: 'Frente brazos en cruz',
    description: 'Vista frontal con brazos extendidos en forma de cruz'
  },
  {
    key: 'side_arms_front',
    label: 'Lateral brazos al frente',
    description: 'Vista lateral con brazos extendidos hacia adelante'
  },
  {
    key: 'back_arms_cross',
    label: 'Espalda brazos en cruz',
    description: 'Vista posterior con brazos extendidos en forma de cruz'
  }
];
