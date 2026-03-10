import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmailBlast } from '@/lib/resend'

const SEGMENT_FILTER: Record<string, object> = {
  all: {},
  newsletter: { segments: { contains: '"newsletter"' } },
  collector: { segments: { contains: '"collector"' } },
  print_buyer: { segments: { contains: '"print_buyer"' } },
  workshop_attendee: { segments: { contains: '"workshop_attendee"' } },
  vip: { segments: { contains: '"vip"' } },
  press: { segments: { contains: '"press"' } },
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const blast = await db.emailBlast.findUnique({ where: { id } })
  if (!blast) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (blast.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Only DRAFT blasts can be sent' }, { status: 409 })
  }

  // Build subscriber query based on segment
  const segmentFilter = SEGMENT_FILTER[blast.segment] ?? {}
  const subscribers = await db.subscriber.findMany({
    where: { isActive: true, ...segmentFilter },
    select: { email: true, firstName: true, lastName: true },
  })

  // Map null → undefined to match BlastRecipient type
  const recipients = subscribers.map((s) => ({
    email: s.email,
    firstName: s.firstName ?? undefined,
    lastName: s.lastName ?? undefined,
  }))

  if (!subscribers.length) {
    return NextResponse.json({ error: 'No active subscribers in this segment' }, { status: 400 })
  }

  // Mark as SENDING
  await db.emailBlast.update({
    where: { id },
    data: { status: 'SENDING', recipientCount: subscribers.length },
  })

  try {
    const { sent, failed } = await sendEmailBlast({
      subject: blast.subject,
      html: blast.html,
      previewText: blast.previewText ?? undefined,
      recipients,
    })

    const updated = await db.emailBlast.update({
      where: { id },
      data: {
        status: failed > 0 && sent === 0 ? 'FAILED' : 'SENT',
        sentCount: sent,
        failedCount: failed,
        sentAt: new Date(),
      },
    })

    return NextResponse.json({ blast: updated, sent, failed })
  } catch (err) {
    await db.emailBlast.update({
      where: { id },
      data: { status: 'FAILED' },
    })
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Send failed' },
      { status: 500 }
    )
  }
}
