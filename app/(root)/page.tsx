import ProductList from '@/components/shared/product/product-list'
import { getLatestProducts } from '@/lib/actions/product.actions'

export const metadata = {
  title: 'Home',
}

export default async function Homepage() {
  const latestProducts = await getLatestProducts()

  return (
    <>
      <ProductList data={ latestProducts } title='Newest Arrivals' />
    </>
)
}
