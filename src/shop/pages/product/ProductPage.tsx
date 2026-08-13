import { useState } from 'react';
import { useParams, Navigate } from 'react-router';
import { Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { CustomFullScreenLoader } from '@/components/custom/CustomFullScreenLoader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useProduct } from '@/shop/hooks/useProduct';

export const ProductPage = () => {
  const { idSlug } = useParams();

  const { data: product, isLoading, isError } = useProduct(idSlug || '');

  const [selectedImage, setSelectedImage] = useState<string | null>(
    product?.images[0] ?? null,
  );

  if (isLoading) {
    return <CustomFullScreenLoader />;
  }

  if (isError || !product) {
    return <Navigate to="/404" replace />;
  }

  const currentImage = selectedImage || product.images[0] || '/placeholder.svg';

  return (
    <div className="container px-4 py-8 mx-auto animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
            <img
              src={currentImage}
              alt={product.title}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {product.images.map((image) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  className={cn(
                    'relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                    currentImage === image
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-transparent hover:border-muted-foreground/25',
                  )}
                >
                  <img
                    src={image}
                    alt={`${product.title} view`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {product.gender}
              </span>
              {product.stock === 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold text-destructive border border-destructive rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mt-2">
              <p className="text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>

              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-muted stroke-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  (4.0)
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Size Selector */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Size</h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border rounded-md transition-all hover:bg-accent',
                    'bg-background text-foreground',
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <h3 className="text-sm font-medium mb-3">Quantity</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-12 text-center text-lg font-medium user-select-none">
                1
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Plus className="h-4 w-4" />
              </Button>
              <span className="ml-2 text-xs text-muted-foreground">
                {product.stock} available
              </span>
            </div>
          </div>

          <div className="grid gap-4 pt-4">
            <Button
              size="lg"
              className="w-full text-base font-medium transition-all hover:shadow-lg active:scale-[0.98]"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Description</h3>
            <div className="prose prose-sm text-muted-foreground leading-relaxed">
              <p>{product.description}</p>
            </div>

            {product.tags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
