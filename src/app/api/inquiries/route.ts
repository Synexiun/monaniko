import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { sendArtworkInquiry } from '@/lib/resend'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { message: { contains: search } },
      ]
    }
    const type = sp.get('type')
    if (type) where.type = type
    const status = sp.get('status')
    if (status) where.status = status

    const [data, total] = await Promise.all([
      db.inquiry.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { artwork: { select: { id: true, title: true } } } }),
      db.inquiry.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch inquiries: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.type || !body.name || !body.email || !body.message) {
      return errorResponse('Missing required fields: type, name, email, message', 400)
    }
    const inquiry = await db.inquiry.create({
      data: {
        type: body.type,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        message: body.message,
        artworkId: body.artworkId || null,
        budget: body.budget || null,
        status: body.status || 'NEW',
      },
    })

    await db.activityLog.create({
      data: { entityType: 'inquiry', entityId: inquiry.id, action: 'create', details: JSON.stringify({ name: inquiry.name, type: inquiry.type }) },
    })

    // Send email notification to admin
    if (inquiry.type === 'artwork' || body.artworkTitle) {
      const artworkTitle = body.artworkTitle ||
        (inquiry.artworkId
          ? (await db.artwork.findUnique({ where: { id: inquiry.artworkId }, select: { title: true } }))?.title || 'Artwork'
          : 'Artwork')

      sendArtworkInquiry({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone || '',
        message: inquiry.message,
        artworkTitle,
        artworkId: inquiry.artworkId || '',
      }).catch(() => {}) // fire-and-forget, don't fail the request
    }

    return jsonResponse(inquiry, 201)
  } catch (e) {
    return errorResponse('Failed to create inquiry: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
