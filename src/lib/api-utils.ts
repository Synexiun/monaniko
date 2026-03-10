import { NextRequest, NextResponse } from 'next/server'

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function parseSort(searchParams: URLSearchParams, allowedFields: string[]) {
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  const field = allowedFields.includes(sortBy) ? sortBy : 'createdAt'
  return { [field]: sortOrder as 'asc' | 'desc' }
}

export function paginatedResponse(data: unknown[], total: number, page: number, limit: number) {
  return jsonResponse({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export function getSearchParam(req: NextRequest, key: string): string | null {
  return req.nextUrl.searchParams.get(key)
}
