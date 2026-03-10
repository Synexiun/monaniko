import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const settings = await db.setting.findMany()
    const result: Record<string, string> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }
    return jsonResponse(result)
  } catch (e) {
    return errorResponse('Failed to fetch settings: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()

    // body is { key: value, key: value, ... }
    const entries = Object.entries(body) as [string, string][]
    for (const [key, value] of entries) {
      const val = typeof value === 'string' ? value : JSON.stringify(value)
      await db.setting.upsert({
        where: { key },
        update: { value: val },
        create: { key, value: val },
      })
    }

    const settings = await db.setting.findMany()
    const result: Record<string, string> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }

    await db.activityLog.create({
      data: { entityType: 'settings', entityId: 'global', action: 'update', details: JSON.stringify(Object.keys(body)) },
    })

    return jsonResponse(result)
  } catch (e) {
    return errorResponse('Failed to update settings: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
