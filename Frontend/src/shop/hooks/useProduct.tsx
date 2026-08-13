import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProductAction } from '../actions/get-product.action';
import { createUpdateProductAction } from '@/admin/actions/create-update-product.action';

export const useProduct = (idSlug: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['product', { idSlug }],
    queryFn: () => getProductAction(idSlug),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: createUpdateProductAction,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({
        queryKey: ['product', { idSlug: product.id }],
      });
      queryClient.setQueryData(['product', { idSlug: product.id }], product);
    },
  });

  return {
    ...query,
    mutation,
  };
};
