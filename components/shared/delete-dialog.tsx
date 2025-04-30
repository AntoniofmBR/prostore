'use client'

import { useState, useTransition } from 'react'

import { useToast } from '@/hooks/use-toast'
import { Button } from '../ui/button'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'


type DialogType = {
  id: string
  action: ( id: string ) => Promise<{ success: boolean, message: string }>
}

export default function DeleteDialog({ id, action }: DialogType) {
  const [ open, setOpen ] = useState(false)
  const [ isPending, startTransition ] = useTransition()

  const { toast } = useToast()

  function handleDeleteClick() {
    startTransition( async () => {
      const res = await action(id)

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        setOpen(false)
        toast({
          description: res.message
        })
      }
    } )
  }

  return (
    <AlertDialog
      open={ open }
      onOpenChange={ setOpen }

    >
      <AlertDialogTrigger asChild>
        <Button
          size='sm'
          variant='destructive'
          className='ml-2'
        >
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolute sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action can&apos;t not be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>
          <Button
            variant='destructive'
            size='sm'
            disabled={ isPending }
            onClick={ handleDeleteClick }
          >
            { isPending ? 'Deleting...' : 'Delete' }
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}