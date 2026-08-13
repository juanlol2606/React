import { eShopApi } from '@/api/eShopApi';
import type { Product } from '@/interfaces/product.interface';

export const getProductAction = async (idSlug: string): Promise<Product> => {
  if (idSlug === 'new') {
    return {
      id: 'new',
      title: '',
      price: 0,
      description: '',
      slug: '',
      stock: 0,
      sizes: [],
      gender: 'men',
      tags: [],
      images: [],
    } as unknown as Product;
  }

  const { data } = await eShopApi<Product>(`/products/${idSlug}`);

  return {
    ...data,
    images: data.images.map((image) => {
      if (image.includes('http')) return image;
      return `${import.meta.env.VITE_API_URL}/files/product/${image}`;
    }),
  };
};
