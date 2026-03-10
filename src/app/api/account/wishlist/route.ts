import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCustomerAuth } from '@/lib/customer-auth'

export async function GET() {
  const auth = await requireCustomerAuth()
  if (auth instanceof NextResponse) return auth

  const items = await db.wishlistItem.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      artwork: {
        select: {
          id: true, title: true, slug: true, images: true,
          category: true, price: true, priceOnInquiry: true, status: true,
        },
      },
      product: {
        select: {
          id: true, title: true, slug: true, images: true,
          type: true, basePrice: true, featured: true,
        },
      },
    },
  })

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const auth = await requireCustomerAuth()
  if (auth instanceof NextResponse) return auth

  const { artworkId, productId } = await req.json()
  if (!artworkId && !productId) {
    return NextResponse.json({ error: 'artworkId or productId is required' }, { status: 400 })
  }

  // Use upsert to avoid duplicate errors
  const item = await db.wishlistItem.upsert({
    where: artworkId
      ? { userId_artworkId: { userId: auth.userId, artworkId } }
      : { userId_productId: { userId: auth.userId, productId } },
    update: {},
    create: {
      userId: auth.userId,
      artworkId: artworkId || null,
      productId: productId || null,
    },
  })

  return NextResponse.json(item, { status: 201 })
}
