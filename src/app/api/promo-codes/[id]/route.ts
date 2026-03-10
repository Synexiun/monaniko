import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const code = await db.promoCode.findUnique({ where: { id } })
    if (!code) return errorResponse('Promo code not found', 404)
    return jsonResponse(code)
  } catch (e) {
    return errorResponse('Failed to fetch promo code: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.code !== undefined) data.code = body.code.toUpperCase()
    if (body.description !== undefined) data.description = body.description
    if (body.discountType !== undefined) data.discountType = body.discountType
    if (body.discountValue !== undefined) data.discountValue = body.discountValue
    if (body.minPurchase !== undefined) data.minPurchase = body.minPurchase
    if (body.maxUses !== undefined) data.maxUses = body.maxUses
    if (body.validFrom !== undefined) data.validFrom = body.validFrom ? new Date(body.validFrom) : null
    if (body.validUntil !== undefined) data.validUntil = body.validUntil ? new Date(body.validUntil) : null
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.usedCount !== undefined) data.usedCount = body.usedCount

    const code = await db.promoCode.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'promo_code', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(code)
  } catch (e) {
    return errorResponse('Failed to update promo code: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    await db.promoCode.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'promo_code', entityId: id, action: 'delete' },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete promo code: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
