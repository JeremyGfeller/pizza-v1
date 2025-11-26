'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Category } from '@/lib/types'

interface CategoryFilterProps {
  categories: Category[]
  currentCategory?: string
}

export function CategoryFilter({ categories, currentCategory = 'all' }: CategoryFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentCategory === 'all' ? 'default' : 'outline'}
          asChild
        >
          <Link href="/menu">All Pizzas</Link>
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={currentCategory === category.slug ? 'default' : 'outline'}
            asChild
          >
            <Link href={`/menu?category=${category.slug}`}>
              {category.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
