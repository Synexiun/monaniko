import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const campaign = await db.campaign.findUnique({ where: { id } })
    if (!campaign) return errorResponse('Campaign not found', 404)
    return jsonResponse(campaign)
  } catch (e) {
    return errorResponse('Failed to fetch campaign: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.objective !== undefined) data.objective = body.objective
    if (body.channels !== undefined) data.channels = JSON.stringify(body.channels)
    if (body.status !== undefined) data.status = body.status
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null
    if (body.targetSegments !== undefined) data.targetSegments = JSON.stringify(body.targetSegments)
    if (body.metrics !== undefined) data.metrics = JSON.stringify(body.metrics)

    // Handle duplicate action
    if (body._action === 'duplicate') {
      const original = await db.campaign.findUnique({ where: { id } })
      if (!original) return errorResponse('Campaign not found', 404)
      const duplicate = await db.campaign.create({
        data: {
          title: original.title + ' (Copy)',
          description: original.description,
          objective: original.objective,
          channels: original.channels,
          status: 'DRAFT',
          targetSegments: original.targetSegments,
          metrics: JSON.stringify({ impressions: 0, clicks: 0, conversions: 0, inquiries: 0, revenue: 0 }),
        },
      })
      return jsonResponse(duplicate, 201)
    }

    const campaign = await db.campaign.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'campaign', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(campaign)
  } catch (e) {
    return errorResponse('Failed to update campaign: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.campaign.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'campaign', entityId: id, action: 'delete' },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete campaign: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
