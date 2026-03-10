import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, parseSort, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)
    const orderBy = parseSort(sp, ['title', 'createdAt', 'basePrice', 'type'])

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { tags: { contains: search } },
      ]
    }
    const type = sp.get('type')
    if (type) where.type = type
    const featured = sp.get('featured')
    if (featured === 'true') where.featured = true

    const [data, total] = await Promise.all([
      db.product.findMany({ where, skip, take: limit, orderBy, include: { variants: true, artwork: { select: { id: true, title: true } } } }),
      db.product.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch products: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const product = await db.product.create({
      data: {
        title: body.title,
        slug: body.slug || slugify(body.title),
        description: body.description || null,
        images: JSON.stringify(body.images || []),
        type: body.type,
        basePrice: body.basePrice,
        artworkId: body.artworkId || null,
        featured: body.featured || false,
        tags: JSON.stringify(body.tags || []),
        variants: body.variants ? {
          create: body.variants.map((v: { name: string; price: number; dimensions?: string; sku?: string; stock?: number }) => ({
            name: v.name,
            price: v.price,
            dimensions: v.dimensions || null,
            sku: v.sku || null,
            stock: v.stock || 0,
          })),
        } : undefined,
      },
      include: { variants: true },
    })

    await db.activityLog.create({
      data: { entityType: 'product', entityId: product.id, action: 'create', details: JSON.stringify({ title: product.title }) },
    })

    return jsonResponse(product, 201)
  } catch (e) {
    return errorResponse('Failed to create product: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
