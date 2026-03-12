import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const ticket = await db.supportTicket.findUnique({ where: { id } })
    if (!ticket) return errorResponse('Ticket not found', 404)
    return jsonResponse(ticket)
  } catch (e) {
    return errorResponse('Failed to fetch ticket: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.status !== undefined) data.status = body.status
    if (body.priority !== undefined) data.priority = body.priority
    if (body.category !== undefined) data.category = body.category
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.resolution !== undefined) data.resolution = body.resolution
    if (body.pageContext !== undefined) data.pageContext = body.pageContext

    const ticket = await db.supportTicket.update({ where: { id }, data })
    return jsonResponse(ticket)
  } catch (e) {
    return errorResponse('Failed to update ticket: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    await db.supportTicket.delete({ where: { id } })
    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete ticket: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
