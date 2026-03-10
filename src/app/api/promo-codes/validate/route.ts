import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code')?.toUpperCase()
  if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 })

  const promo = await db.promoCode.findUnique({ where: { code } })

  if (!promo || !promo.isActive) {
    return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 404 })
  }

  const now = new Date()
  if (promo.validFrom && promo.validFrom > now) {
    return NextResponse.json({ error: 'This promo code is not yet active' }, { status: 400 })
  }
  if (promo.validUntil && promo.validUntil < now) {
    return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 })
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 400 })
  }

  return NextResponse.json({
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    minPurchase: promo.minPurchase,
    description: promo.description,
  })
}
