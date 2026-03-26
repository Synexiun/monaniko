import { NextRequest } from 'next/server'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

// Keys that the admin can view/edit through the UI
const MANAGED_KEYS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RESEND_API_KEY',
  'ADMIN_EMAIL',
  'FROM_EMAIL',
  'FROM_NAME',
] as const

function getEnvPath() {
  return path.resolve(process.cwd(), '.env')
}

function parseEnvFile(): Record<string, string> {
  const envPath = getEnvPath()
  if (!fs.existsSync(envPath)) return {}

  const content = fs.readFileSync(envPath, 'utf-8')
  const result: Record<string, string> = {}

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    result[key] = value
  }

  return result
}

function writeEnvFile(vars: Record<string, string>) {
  const envPath = getEnvPath()
  let content = ''

  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8')
  }

  // Update existing keys or append new ones
  const lines = content.split('\n')
  const updatedKeys = new Set<string>()

  const updatedLines = lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return line
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) return line
    const key = trimmed.slice(0, eqIndex).trim()
    if (key in vars) {
      updatedKeys.add(key)
      return `${key}="${vars[key]}"`
    }
    return line
  })

  // Append any keys that didn't exist yet
  for (const [key, value] of Object.entries(vars)) {
    if (!updatedKeys.has(key)) {
      updatedLines.push(`${key}="${value}"`)
    }
  }

  fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf-8')
}

/** Mask a secret key, showing only the prefix and last 4 chars */
function maskValue(key: string, value: string): string {
  const sensitiveKeys = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CLOUDINARY_API_SECRET',
    'RESEND_API_KEY',
  ]
  if (!sensitiveKeys.includes(key) || !value || value.length < 12) return value
  const prefix = value.slice(0, value.indexOf('_', 3) + 1 || 8)
  const suffix = value.slice(-4)
  return `${prefix}...${suffix}`
}

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const envVars = parseEnvFile()
    const result: Record<string, { value: string; masked: string; isSet: boolean }> = {}

    for (const key of MANAGED_KEYS) {
      const value = envVars[key] || ''
      const isPlaceholder = value.includes('REPLACE_WITH')
      result[key] = {
        value: value,
        masked: maskValue(key, value),
        isSet: !!value && !isPlaceholder,
      }
    }

    return jsonResponse(result)
  } catch (e) {
    return errorResponse('Failed to read integrations: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const body: Record<string, string> = await req.json()

    // Only allow updating managed keys
    const updates: Record<string, string> = {}
    for (const [key, value] of Object.entries(body)) {
      if ((MANAGED_KEYS as readonly string[]).includes(key)) {
        updates[key] = value
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid keys to update', 400)
    }

    writeEnvFile(updates)

    // Re-read to confirm
    const envVars = parseEnvFile()
    const result: Record<string, { value: string; masked: string; isSet: boolean }> = {}
    for (const key of MANAGED_KEYS) {
      const value = envVars[key] || ''
      const isPlaceholder = value.includes('REPLACE_WITH')
      result[key] = {
        value: value,
        masked: maskValue(key, value),
        isSet: !!value && !isPlaceholder,
      }
    }

    return jsonResponse(result)
  } catch (e) {
    return errorResponse('Failed to update integrations: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
