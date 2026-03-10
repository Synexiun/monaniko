import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { tags: { contains: search } },
      ]
    }
    const status = sp.get('status')
    if (status) where.status = status

    const [data, total] = await Promise.all([
      db.journalPost.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.journalPost.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch journal posts: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const post = await db.journalPost.create({
      data: {
        title: body.title,
        slug: body.slug || slugify(body.title),
        excerpt: body.excerpt || null,
        content: body.content || null,
        coverImage: body.coverImage || null,
        author: body.author || 'Mona Niko',
        category: body.category || null,
        tags: JSON.stringify(body.tags || []),
        status: body.status || 'DRAFT',
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        seoImage: body.seoImage || null,
      },
    })

    await db.activityLog.create({
      data: { entityType: 'journal', entityId: post.id, action: 'create', details: JSON.stringify({ title: post.title }) },
    })

    return jsonResponse(post, 201)
  } catch (e) {
    return errorResponse('Failed to create journal post: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
