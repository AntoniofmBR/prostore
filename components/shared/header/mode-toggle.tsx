"use client"

import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon, SunMoon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

export default function ModeToggle() {
  const [ mounted, setMounted ] = useState(false)

  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  },[])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild >
        <Button
          variant='ghost'
          className='focus-visible:ring-0 focus-visible:ring-off'
        >
          { theme === 'system' ? (
            <SunMoon />
          ) : theme === 'dark' ? (
            <MoonIcon />
          ) : (
            <SunIcon />
          ) }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={ theme === 'system' }
          onClick={ () => setTheme('system') }
        >
          System
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={ theme === 'light' }
          onClick={ () => setTheme('light') }
        >
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={ theme === 'dark' }
          onClick={ () => setTheme('dark') }
        >
          Dark
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}