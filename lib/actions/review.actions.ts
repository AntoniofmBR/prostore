'use server'

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/db/prisma';

import { insertReviewSchema } from '../validators';
import { formatError } from '../utils';

// Create & Update Reviews
export async function createUpdateReview(data: z.infer<typeof insertReviewSchema>) {
  try {
    const session = await auth()

    if (!session) throw new Error('User is not authenticated')

    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    })

    const product = await prisma.product.findFirst({
      where: {
        id: review.productId,
      },
    })

    if (!product) throw new Error('Product not found')

    const reviewExists = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    })

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        // Update Review
        await tx.review.update({
          where: {
            id: reviewExists.id,
          },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        })
      } else {
        // Create Review
        await tx.review.create({
          data: review,
        })
      }

      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: {
          productId: review.productId
        },
      })

      const numReviews = await tx.review.count({
        where: {
          productId: review.productId
        },
      })

      // Update the rating and numReviews in product table
      await tx.product.update({
        where: {
          id: review.productId,
        },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        }
      })
    })

    revalidatePath(`/product/${product.slug}`)

    return {
      success: true,
      message: 'Review Updated Successfully',
    }

  } catch (err) {
    return {
      success: false,
      message: formatError(err)
    }
  }
}

// Get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: {
      productId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    data,
  }
}

// Get a review written by the current user
export async function getReviewByProductId({ productId }: { productId: string }) {
  const session = await auth()

  if (!session) throw new Error('User is not authenticated')

  return await prisma.review.findFirst({
    where: {
      productId,
      userId: session.user.id,
    },
  })
}