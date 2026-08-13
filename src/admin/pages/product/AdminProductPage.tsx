import { Navigate, useNavigate, useParams } from 'react-router';
import { useProduct } from '@/shop/hooks/useProduct';
import { CustomFullScreenLoader } from '@/components/custom/CustomFullScreenLoader';
import { ProductForm } from './ui/ProductForm';
import type { Product } from '@/interfaces/product.interface';
import { toast } from 'sonner';

export const AdminProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoading, isError, data: product, mutation } = useProduct(id || '');

  const title = id === 'new' ? 'New product' : 'Edit product';
  const subtitle =
    id === 'new'
      ? 'Here you can create a new product.'
      : 'Here you can edit the product.';

  const handleSubmit = async (
    productLike: Partial<Product> & { files?: File[] },
  ) => {
    console.log(productLike);

    await mutation.mutateAsync(productLike, {
      onSuccess: (data) => {
        toast.success('Product created/updated successfully', {
          position: 'top-right',
        });
        navigate(`/admin/products/${data.id}`);
      },
      onError: (error) => {
        console.log(error);
        toast.error('Error trying to create/update product');
      },
    });
  };

  if (isError) {
    return <Navigate to="/admin/products" />;
  }

  if (isLoading) {
    return <CustomFullScreenLoader />;
  }

  if (!product) {
    return <Navigate to="/admin/products" />;
  }

  return (
    <ProductForm
      title={title}
      subTitle={subtitle}
      product={product}
      isPositing={mutation.isPending}
      onSubmit={handleSubmit}
    />
  );
};
