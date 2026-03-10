import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
      ]
    }
    const active = sp.get('active')
    if (active === 'true') where.isActive = true
    if (active === 'false') where.isActive = false

    const [data, total] = await Promise.all([
      db.promoCode.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.promoCode.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch promo codes: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()

    // Check code uniqueness
    if (body.code) {
      const existing = await db.promoCode.findUnique({ where: { code: body.code.toUpperCase() } })
      if (existing) return errorResponse('Promo code already exists', 409)
    }

    const promoCode = await db.promoCode.create({
      data: {
        code: (body.code || generateCode()).toUpperCase(),
        description: body.description || null,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minPurchase: body.minPurchase || null,
        maxUses: body.maxUses || null,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        isActive: body.isActive ?? true,
      },
    })

    await db.activityLog.create({
      data: { entityType: 'promo_code', entityId: promoCode.id, action: 'create', details: JSON.stringify({ code: promoCode.code }) },
    })

    return jsonResponse(promoCode, 201)
  } catch (e) {
    return errorResponse('Failed to create promo code: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'MONA'
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
  return code
}
