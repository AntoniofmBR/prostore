'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Loader } from 'lucide-react';

import { Cart, CartItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { ToastAction } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';

export default function AddToCart({ cart, item }: { cart?: Cart  ,item: CartItem }) {
  const router = useRouter();
  const { toast } = useToast();

  const [ isPending, startTransition ] = useTransition()

  async function handleAddToCart() {
    startTransition(async () => { 
      const res = await addItemToCart(item);

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        });
        return;
      }
  
      // Handle success add to cart
      toast({
        description: `${item.name} added to cart`,
        action: (
          <ToastAction
            className='bg-primary text-white hover:bg-gray-800'
            altText='Go To Cart'
            onClick={() => router.push('/cart')}
          >
            Go To Cart
          </ToastAction>
        ),
      });
     })
  };

  async function handleRemoveFromCart() {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      toast({
        variant: res.success ? 'default' : 'destructive',
        description: res.message,
      });

      return;
    });
  }

  // Check if item is in cart
  const existItem = cart && cart.items.find((x) => x.productId === item.productId)



  return existItem ? (
    <div>
      <Button
        type='button'
        onClick={ handleRemoveFromCart }
      >
        { isPending ? (
          <Loader className='h-4 w-4 animate-spin' />
        ) : (
          <Minus className='h-4 w-4' />
        ) }
      </Button>
      <span className='px-2' >
        { existItem.qty }
      </span>
      <Button
        type='button'
        onClick={ handleAddToCart }
      >
        { isPending ? (
          <Loader className='h-4 w-4 animate-spin' />
        ) : (
          <Plus className='h-4 w-4' />
        ) }
      </Button>
    </div>
  ) : (
    <Button className='w-full' type='button' onClick={handleAddToCart}>
      <Plus /> Add To Cart
    </Button>
  );
};