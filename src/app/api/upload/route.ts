import { NextRequest } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { requireAuth } from '@/lib/auth'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const formData = await req.formData()
    const folder = (formData.get('folder') as string) || 'mona-niko-gallery'

    const urls: string[] = []
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return errorResponse('No files provided', 400)
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(`File ${file.name} exceeds 10MB limit`, 400)
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return errorResponse(`File type ${file.type} is not allowed`, 400)
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const result = await uploadImage(buffer, folder, {
        public_id: `${Date.now()}-${file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
      })

      urls.push(result.url)
    }

    return jsonResponse({ urls })
  } catch (e) {
    console.error('Upload failed:', e)
    return errorResponse('Upload failed: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
