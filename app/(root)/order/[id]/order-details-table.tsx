'use client'

import Link from 'next/link';
import Image from 'next/image';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useTransition } from 'react';


import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import {
  createPayPalOrder,
  approvePayPalOrder,
  updateOrderToPaidCOD,
  deliverOrder,
} from '@/lib/actions/order.actions';

import { Order } from '@/types';

import { useToast } from '@/hooks/use-toast';

import StripePayment from './stripe-payment';

export default function OrderDetailsTable({
  order,
  paypalClientId,
  stripeClientSecret,
  isAdmin,
}: {
  order: Omit<Order, 'paymentResult'>,
  paypalClientId: string,
  stripeClientSecret: string | null
  isAdmin: boolean,
}) {
  const {
    shippingAddress,
    orderItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
  } = order
  const { toast } = useToast()

  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()
    let status = ''

    if (isPending) {
      status = 'Loading PayPal...'
    } else if (isRejected) {
      status = 'Error Loading PayPal'
    }

    return status
  }

  async function handleCreatePayPalOrder() {
    const res = await createPayPalOrder(order.id)

    if (!res.success) {
      toast({
        variant: 'destructive',
        description: res.message,
      })
    }

    return res.data
  }

  async function handleApprovePayPalOrder(data: { orderID: string }) {
    const res = await approvePayPalOrder(order.id, data)

    toast({
      variant: res.success ? 'default' : 'destructive',
      description: res.message,
    })
  }

  function MarkAsPaidButton() {
    const  [ isPending, startTransition ] = useTransition()
    const { toast } = useToast()

    return (
      <Button
        type='button'
        disabled={ isPending }
        onClick={ () => startTransition(async () => {
          const res = await updateOrderToPaidCOD(order.id)
          toast({
            variant: res.success ? 'default' : 'destructive',
            description: res.message
          })
        }) }
      >
        { isPending ? 'Processing...' : 'Mark As Paid' }
      </Button>
    )
  }

  function MarkAsDeliveredButton() {
    const  [ isPending, startTransition ] = useTransition()
    const { toast } = useToast()

    return (
      <Button
        type='button'
        disabled={ isPending }
        onClick={ () => startTransition(async () => {
          const res = await deliverOrder(order.id)
          toast({
            variant: res.success ? 'default' : 'destructive',
            description: res.message
          })
        }) }
      >
        { isPending ? 'Processing...' : 'Mark As Delivered' }
      </Button>
    )
  }

  return (
    <>
      <h1 className="py-4 text-2xl">
        Order { formatId(order.id) }
      </h1>
      <div className="grid md:grid-cols-3 md:gap-3">
        <div className="col-span-2 space-4-y overflow-x-auto">
          <Card>
            <CardContent className='p-4 gap-4' >
              <h2 className="text-xl pb-4">
                Payment Method
              </h2>
              <p className='pb-2' >{ paymentMethod }</p>
              { isPaid ? (
                <Badge variant='secondary' >
                  Paid at { formatDateTime(paidAt!).dateTime }
                </Badge>
              ) : (
                <Badge variant='destructive' >
                  Not Paid
                </Badge>
              ) }
            </CardContent>
          </Card>
          <Card className='my-2' >
            <CardContent className='p-4 gap-4' >
              <h2 className="text-xl pb-4">
                Shipping Address
              </h2>
              <p>
                { shippingAddress.fullName }, { shippingAddress.city }
                { shippingAddress.postalCode }, { shippingAddress.country }
              </p>
              <p className='pb-2' >{ shippingAddress.streetAddress }</p>
              { isDelivered ? (
                <Badge variant='secondary' >
                  Delivered at { formatDateTime(deliveredAt!).dateTime }
                </Badge>
              ) : (
                <Badge variant='destructive' >
                  Not Delivered
                </Badge>
              ) }
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4 gap-4' >
              <h2 className="text-xl pb-4">
                Order Items
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  { orderItems.map((item) => (
                    <TableRow key={ item.slug } >
                      <TableCell>
                        <Link
                          href={ `/product/${item.slug}` }
                          className='flex items-centers'
                        >
                          <Image
                            src={ item.image }
                            alt={ item.name }
                            height={ 50 }
                            width={ 50 }
                          />
                          <span className='px-2' >
                            { item.name }
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">
                          { item.qty }
                        </span>
                      </TableCell>
                      <TableCell className='text-right' >
                        ${ item.price }
                      </TableCell>
                    </TableRow>
                  )) }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className='p-4 gap-4 space-y-4' >
              <div className='flex justify-between' >
                <div>Items</div>
                <div>{ formatCurrency(itemsPrice) }</div>
              </div>
              <div className='flex justify-between' >
                <div>Tax</div>
                <div>{ formatCurrency(taxPrice) }</div>
              </div>
              <div className='flex justify-between' >
                <div>Shipping</div>
                <div>{ formatCurrency(shippingPrice) }</div>
              </div>
              <div className='flex justify-between' >
                <div>Total</div>
                <div>{ formatCurrency(totalPrice) }</div>
              </div>
              {/** PayPal Payment */}
              { !isPaid && paymentMethod === 'PayPal' && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }} >
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={ handleCreatePayPalOrder }
                      onApprove={ handleApprovePayPalOrder }
                    />
                  </PayPalScriptProvider>
                </div>
              ) }

              {/* Stripe Payment */}
              {
                !isPaid && paymentMethod === 'Stripe' && stripeClientSecret && (
                  <StripePayment
                    priceInCents={ Number(order.totalPrice) * 100 }
                    orderId={ order.id }
                    clientSecret={ stripeClientSecret }
                  />
                )
              }

              {/** Cash On Delivery */}
              {
                isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                  <MarkAsPaidButton />
                )
              }
              {
                isAdmin && isPaid && !isDelivered && (
                  <MarkAsDeliveredButton />
                )
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}