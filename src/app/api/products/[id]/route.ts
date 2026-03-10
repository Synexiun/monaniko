import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

function safeJson<T>(val: unknown, fallback: T): T {
  if (typeof val !== 'string') return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id }, include: { variants: true, artwork: true } })
    if (!product) return errorResponse('Product not found', 404)
    return jsonResponse({ ...product, images: safeJson(product.images, []), tags: safeJson(product.tags, []) })
  } catch (e) {
    return errorResponse('Failed to fetch product: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.title !== undefined) data.title = body.title
    if (body.slug !== undefined) data.slug = body.slug
    if (body.description !== undefined) data.description = body.description
    if (body.images !== undefined) data.images = JSON.stringify(body.images)
    if (body.type !== undefined) data.type = body.type
    if (body.basePrice !== undefined) data.basePrice = body.basePrice
    if (body.artworkId !== undefined) data.artworkId = body.artworkId
    if (body.featured !== undefined) data.featured = body.featured
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags)

    const product = await db.product.update({ where: { id }, data })

    // Handle variants update
    if (body.variants) {
      await db.productVariant.deleteMany({ where: { productId: id } })
      for (const v of body.variants) {
        await db.productVariant.create({
          data: { productId: id, name: v.name, price: v.price, dimensions: v.dimensions || null, sku: v.sku || null, stock: v.stock || 0 },
        })
      }
    }

    await db.activityLog.create({
      data: { entityType: 'product', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    const updated = await db.product.findUnique({ where: { id }, include: { variants: true } })
    return jsonResponse(updated)
  } catch (e) {
    return errorResponse('Failed to update product: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id } })
    if (!product) return errorResponse('Product not found', 404)

    await db.product.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'product', entityId: id, action: 'delete', details: JSON.stringify({ title: product.title }) },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete product: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
