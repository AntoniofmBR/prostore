import { Metadata } from 'next'

import notFound from '@/app/not-found'
import { getProductById } from '@/lib/actions/product.actions'
import ProductForm from '@/components/admin/product-form'

export const metadata: Metadata = {
  title: 'Update Products'
}

export default async function AdminProductUpdatePage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } = await props.params

  const product = await getProductById(id)

  if (!product) return notFound()

  return (
    <div className='space-y-8 max-w-5xl mx-auto' >
      <h1 className="h2-bold">
        Update Product
      </h1>
      <ProductForm
        type='Update'
        product={ product }
        productId={ product.id }
      />
    </div>
  )
}