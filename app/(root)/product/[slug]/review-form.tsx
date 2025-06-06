'use client'

import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { StarIcon } from 'lucide-react'
import { z } from 'zod'

import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'

import { insertReviewSchema } from '@/lib/validators'
import { reviewFormDefaultValues } from '@/lib/constants'
import { createUpdateReview, getReviewByProductId } from '@/lib/actions/review.actions'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function ReviewForm({
  userId,
  productId,
  onReviewSubmitted,
}: {
  userId: string
  productId: string
  onReviewSubmitted: () => void
}) {
  const [ open, setOpen ] = useState(false)

  const { toast } = useToast()

  const form = useForm<z.infer<typeof insertReviewSchema>>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: reviewFormDefaultValues,
  })

  async function handleOpenForm() {
    form.setValue('productId', productId)
    form.setValue('userId', userId)

    const review = await getReviewByProductId({ productId })

    if (review) {
      form.setValue('title', review.title)
      form.setValue('description', review.description)
      form.setValue('rating', review.rating)
    }

    setOpen(true)
  }

  const onSubmit: SubmitHandler<z.infer<typeof insertReviewSchema>> = async (values) => {
    const res = await createUpdateReview({ ...values, productId });

    if (!res.success) {
      return toast({
        variant: 'destructive',
        description: res.message,
      });
    }

    setOpen(false);

    onReviewSubmitted();

    toast({
      description: res.message,
    });
  }

  return (
    <Dialog open={ open } onOpenChange={ setOpen } >
      <DialogTrigger asChild >
        <Button className='mt-2' variant='default' onClick={handleOpenForm}>
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]' >
        <Form { ...form } >
          <form
            method='post'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your thoughts with other customers
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={ form.control }
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter title' { ...field } />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={ form.control }
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter description'
                        { ...field }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={ form.control }
                name='rating'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <Select
                        onValueChange={ field.onChange }
                        value={ field.value.toString() }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          { Array.from({ length: 5 }).map((_, index) => (
                            <SelectItem
                              key={ index }
                              value={ (index + 1).toString() }
                            >
                              { index + 1 }{' '} <StarIcon className='inline h-4 w-4' />
                            </SelectItem>
                          )) }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )
                }}
              />
            </div>
            <DialogFooter>
              <Button
                type='submit'
                size='lg'
                className='w-full'
                disabled={ form.formState.isSubmitting }
              >
                { form.formState.isSubmitting ? 'Submitting...' : 'Submit' }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
