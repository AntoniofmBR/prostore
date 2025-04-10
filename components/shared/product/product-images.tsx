'use client'

import { useState } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

export default function ProductImages({ images }: { images: string[] }) {
  const [ current, setCurrent ] = useState(0)

  return (
    <div>
      <Image
        src={ images[current] }
        alt={ images[current] }
        height={ 1000 }
        width={ 1000 }
        className='min-h-[300px] object-cover object-center '
      />
      <div className="flex">
        { images.map((image, index) => (
          <div
            key={`${image}.${index}`}
            onClick={ () => setCurrent(index) }
            className={ cn(
              'border mr-2 cursor-pointer hover:border-orange-600',
              current === index && 'border-orange-500',
            ) }
          >
            <Image
              src={ image }
              alt={ image }
              height={ 100 }
              width={ 100 }
            />
          </div>
        )) }
      </div>
    </div>
  )
}