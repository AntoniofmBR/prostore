'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@/db/prisma';

import { convertToPlainObject, formatError } from '../utils';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '../constants';
import { insertProductSchema, updateProductSchema } from '../validators';

export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: 'desc' },
  });

  return convertToPlainObject(data);
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug }
  })
}

export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: {
      id: productId,
    },
  })

  return convertToPlainObject(data)
}

export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
}) {
  const data = await prisma.product.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
      category: category ? category : undefined,
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
      category: category ? category : undefined,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: {
        id,
      },
    })

    if (!productExists) throw new Error('Product not found')


    await prisma.product.delete({
      where: {
        id,
      },
    })

    revalidatePath('/admin/products')

    return {
      success: true,
      message: 'Product Deleted Successfully'
    }

  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({ data: product });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product created successfully',
    };
  } catch (err) {
    console.log(err)
    return { success: false, message: formatError(err) };
  }
}

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data)

    const productExists = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    })

    if (!productExists) throw new Error('Product not found')

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data,
    })

    revalidatePath('/admin/products')

    return {
      success: true,
      message: 'Product Updated Successfully',
    }

  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}
