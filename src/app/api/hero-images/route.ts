import { jsonResponse, errorResponse } from '@/lib/api-utils'
import fs from 'fs'
import path from 'path'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'header_main_page')

    if (!fs.existsSync(dir)) {
      return jsonResponse([])
    }

    const files = fs.readdirSync(dir)
      .filter((f) => {
        const ext = path.extname(f).toLowerCase()
        return IMAGE_EXTENSIONS.has(ext) && !f.startsWith('.')
      })
      .sort()
      .map((f) => `/images/header_main_page/${f}`)

    return jsonResponse(files)
  } catch (e) {
    return errorResponse('Failed to read hero images: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
