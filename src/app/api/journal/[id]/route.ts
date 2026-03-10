import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await db.journalPost.findUnique({ where: { id } })
    if (!post) return errorResponse('Journal post not found', 404)
    return jsonResponse(post)
  } catch (e) {
    return errorResponse('Failed to fetch journal post: ' + (e instanceof Error ? e.message : ''), 500)
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
    if (body.excerpt !== undefined) data.excerpt = body.excerpt
    if (body.content !== undefined) data.content = body.content
    if (body.coverImage !== undefined) data.coverImage = body.coverImage
    if (body.author !== undefined) data.author = body.author
    if (body.category !== undefined) data.category = body.category
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags)
    if (body.status !== undefined) data.status = body.status
    if (body.publishedAt !== undefined) data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null
    if (body.scheduledAt !== undefined) data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription
    if (body.seoImage !== undefined) data.seoImage = body.seoImage

    const post = await db.journalPost.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'journal', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(post)
  } catch (e) {
    return errorResponse('Failed to update journal post: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const post = await db.journalPost.findUnique({ where: { id } })
    if (!post) return errorResponse('Journal post not found', 404)
    await db.journalPost.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'journal', entityId: id, action: 'delete', details: JSON.stringify({ title: post.title }) },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete journal post: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
