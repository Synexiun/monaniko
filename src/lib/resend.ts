import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set — emails will not be sent')
}

export const resend = new Resend(process.env.RESEND_API_KEY || '')

const FROM = `${process.env.FROM_NAME || 'Mona Niko Gallery'} <${process.env.FROM_EMAIL || 'noreply@monaniko.com'}>`
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@monaniko.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monaniko.com'

// ─── Order Confirmation ───────────────────────────────────────
export interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{ title: string; price: number; quantity: number; image?: string }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #E8E5E0;">
          <span style="font-family:Georgia,serif;font-size:15px;color:#1A1A1A;">${item.title}</span>
          ${item.quantity > 1 ? `<span style="color:#4A4A4A;font-size:13px;"> × ${item.quantity}</span>` : ''}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #E8E5E0;text-align:right;font-size:15px;color:#1A1A1A;">
          $${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </td>
      </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#1A1A1A;padding:32px 40px;text-align:center;">
          <a href="${SITE_URL}" style="font-family:Georgia,serif;font-size:22px;color:#C4A265;text-decoration:none;letter-spacing:0.1em;">
            MONA NIKO GALLERY
          </a>
        </td></tr>

        <!-- Gold bar -->
        <tr><td style="background:#C4A265;height:3px;"></td></tr>

        <!-- Body -->
        <tr><td style="padding:48px 40px;">
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#1A1A1A;margin:0 0 8px;">
            Thank You for Your Order
          </h1>
          <p style="font-size:15px;color:#4A4A4A;margin:0 0 32px;line-height:1.6;">
            Dear ${data.customerName}, your order has been confirmed and we're preparing it with care.
          </p>

          <div style="background:#FAFAF8;border:1px solid #E8E5E0;padding:20px 24px;margin-bottom:32px;">
            <p style="margin:0;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#4A4A4A;">Order Number</p>
            <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:20px;color:#1A1A1A;">${data.orderNumber}</p>
          </div>

          <!-- Items -->
          <h2 style="font-family:Georgia,serif;font-size:18px;font-weight:400;color:#1A1A1A;margin:0 0 16px;">
            Order Details
          </h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8E5E0;">
            ${itemsHtml}
            <tr>
              <td style="padding:12px 0;" colspan="2">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px;color:#4A4A4A;padding:4px 0;">Subtotal</td>
                    <td style="font-size:14px;color:#4A4A4A;text-align:right;">$${data.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;color:#4A4A4A;padding:4px 0;">Shipping</td>
                    <td style="font-size:14px;color:#4A4A4A;text-align:right;">${data.shipping === 0 ? 'Free' : '$' + data.shipping.toFixed(2)}</td>
                  </tr>
                  ${data.tax > 0 ? `<tr><td style="font-size:14px;color:#4A4A4A;padding:4px 0;">Tax</td><td style="font-size:14px;color:#4A4A4A;text-align:right;">$${data.tax.toFixed(2)}</td></tr>` : ''}
                  <tr>
                    <td style="font-size:17px;color:#1A1A1A;font-weight:600;padding-top:12px;border-top:1px solid #E8E5E0;">Total</td>
                    <td style="font-family:Georgia,serif;font-size:20px;color:#1A1A1A;text-align:right;padding-top:12px;border-top:1px solid #E8E5E0;">
                      $${data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Shipping Address -->
          <div style="margin-top:32px;padding:20px 24px;background:#FAFAF8;border:1px solid #E8E5E0;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#4A4A4A;">Shipping To</p>
            <p style="margin:0;font-size:15px;color:#1A1A1A;line-height:1.6;">
              ${data.shippingAddress.line1}<br>
              ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zip}<br>
              ${data.shippingAddress.country}
            </p>
          </div>

          <p style="margin:32px 0 0;font-size:14px;color:#4A4A4A;line-height:1.8;">
            We will send you tracking information as soon as your order ships.
            If you have any questions, please reply to this email or contact us at
            <a href="mailto:${ADMIN_EMAIL}" style="color:#C4A265;">${ADMIN_EMAIL}</a>.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#2C2C2C;padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#C5C0B8;letter-spacing:0.1em;">
            © ${new Date().getFullYear()} Mona Niko Gallery · 668B The Shops at Mission Viejo Mall · Mission Viejo, CA 92691
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    bcc: ADMIN_EMAIL,
    subject: `Order Confirmed — ${data.orderNumber} | Mona Niko Gallery`,
    html,
  })
}

// ─── Inquiry Notification ─────────────────────────────────────
export interface InquiryEmailData {
  name: string
  email: string
  phone?: string
  type: string
  message: string
  artworkTitle?: string
  budget?: string
}

export async function sendInquiryNotification(data: InquiryEmailData) {
  const typeLabels: Record<string, string> = {
    ARTWORK: 'Artwork Inquiry',
    COMMISSION: 'Commission Request',
    PRIVATE_VIEWING: 'Private Viewing Request',
    GENERAL: 'General Inquiry',
    PRESS: 'Press Inquiry',
  }

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">
        <tr><td style="background:#1A1A1A;padding:24px 40px;text-align:center;">
          <span style="font-family:Georgia,serif;font-size:18px;color:#C4A265;letter-spacing:0.1em;">MONA NIKO GALLERY</span>
        </td></tr>
        <tr><td style="background:#C4A265;height:3px;"></td></tr>
        <tr><td style="padding:40px;">
          <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1A1A1A;margin:0 0 24px;">
            New ${typeLabels[data.type] || data.type}
          </h1>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              ['From', data.name],
              ['Email', `<a href="mailto:${data.email}" style="color:#C4A265;">${data.email}</a>`],
              data.phone ? ['Phone', data.phone] : null,
              ['Type', typeLabels[data.type] || data.type],
              data.artworkTitle ? ['Artwork', data.artworkTitle] : null,
              data.budget ? ['Budget', data.budget] : null,
            ]
              .filter(Boolean)
              .map(
                (row) =>
                  `<tr>
                    <td style="padding:8px 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#4A4A4A;width:100px;vertical-align:top;">${row![0]}</td>
                    <td style="padding:8px 0;font-size:15px;color:#1A1A1A;">${row![1]}</td>
                  </tr>`
              )
              .join('')}
          </table>
          <div style="margin:24px 0;padding:20px;background:#FAFAF8;border-left:3px solid #C4A265;">
            <p style="margin:0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#4A4A4A;margin-bottom:8px;">Message</p>
            <p style="margin:0;font-size:15px;color:#2C2C2C;line-height:1.7;">${data.message.replace(/\n/g, '<br>')}</p>
          </div>
          <a href="mailto:${data.email}?subject=Re: ${typeLabels[data.type] || 'Your inquiry'}"
             style="display:inline-block;background:#C4A265;color:#fff;text-decoration:none;padding:12px 28px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">
            Reply to ${data.name}
          </a>
        </td></tr>
        <tr><td style="background:#2C2C2C;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#C5C0B8;">Received via monaniko.com · ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `New ${typeLabels[data.type] || 'Inquiry'} from ${data.name}`,
    html,
  })
}

// ─── Email Blast (Batch) ───────────────────────────────────────
export interface BlastRecipient {
  email: string
  firstName?: string
  lastName?: string
}

export async function sendEmailBlast(data: {
  subject: string
  html: string
  previewText?: string
  recipients: BlastRecipient[]
}): Promise<{ sent: number; failed: number }> {
  if (!data.recipients.length) return { sent: 0, failed: 0 }

  // Resend batch API supports up to 100 emails per call
  const BATCH_SIZE = 100
  let sent = 0
  let failed = 0

  for (let i = 0; i < data.recipients.length; i += BATCH_SIZE) {
    const batch = data.recipients.slice(i, i + BATCH_SIZE)
    try {
      const emails = batch.map((r) => ({
        from: FROM,
        to: r.email,
        subject: data.subject,
        html: data.html,
        ...(data.previewText ? { headers: { 'X-Preview-Text': data.previewText } } : {}),
      }))
      const result = await resend.batch.send(emails)
      // resend.batch.send returns { data: [...], error }
      if (result.error) {
        failed += batch.length
      } else {
        sent += batch.length
      }
    } catch {
      failed += batch.length
    }
  }

  return { sent, failed }
}

// ─── Workshop Booking Confirmation ────────────────────────────
export async function sendWorkshopConfirmation(data: {
  customerName: string
  customerEmail: string
  workshopTitle: string
  workshopDate: string
  workshopLocation: string
  price: number
  orderNumber: string
}) {
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">
        <tr><td style="background:#1A1A1A;padding:24px 40px;text-align:center;">
          <span style="font-family:Georgia,serif;font-size:18px;color:#C4A265;letter-spacing:0.1em;">MONA NIKO GALLERY</span>
        </td></tr>
        <tr><td style="background:#C4A265;height:3px;"></td></tr>
        <tr><td style="padding:48px 40px;">
          <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1A1A1A;margin:0 0 8px;">
            Workshop Booking Confirmed
          </h1>
          <p style="font-size:15px;color:#4A4A4A;margin:0 0 32px;line-height:1.6;">
            Dear ${data.customerName}, we can't wait to see you!
          </p>
          <div style="background:#FAFAF8;border:1px solid #C4A265;padding:24px;margin-bottom:32px;">
            <h2 style="font-family:Georgia,serif;font-size:20px;font-weight:400;color:#1A1A1A;margin:0 0 16px;">
              ${data.workshopTitle}
            </h2>
            <p style="margin:4px 0;font-size:14px;color:#4A4A4A;">📅 ${data.workshopDate}</p>
            <p style="margin:4px 0;font-size:14px;color:#4A4A4A;">📍 ${data.workshopLocation}</p>
            <p style="margin:16px 0 0;font-family:Georgia,serif;font-size:18px;color:#1A1A1A;">
              $${data.price.toFixed(2)} per person
            </p>
          </div>
          <p style="font-size:13px;color:#4A4A4A;line-height:1.8;margin:0;">
            Booking reference: <strong>${data.orderNumber}</strong><br>
            Please arrive 10 minutes early. All materials are included.<br>
            Cancellations are accepted up to 72 hours before the workshop for a full refund.
          </p>
        </td></tr>
        <tr><td style="background:#2C2C2C;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#C5C0B8;">Mona Niko Gallery · 668B The Shops at Mission Viejo Mall · Mission Viejo, CA 92691</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    bcc: ADMIN_EMAIL,
    subject: `Workshop Confirmed — ${data.workshopTitle} | Mona Niko Gallery`,
    html,
  })
}

// ─── Auction: Outbid Notification ──────────────────────────────
export async function sendAuctionOutbid(data: {
  bidderName: string
  bidderEmail: string
  artworkTitle: string
  previousBid: number
  newBid: number
  auctionSlug: string
  endAt: Date
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monaniko.com'
  const FROM = `${process.env.FROM_NAME || 'Mona Niko Gallery'} <${process.env.FROM_EMAIL || 'noreply@monaniko.com'}>`
  const auctionUrl = `${SITE_URL}/auctions/${data.auctionSlug}`
  const endDate = new Date(data.endAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

  const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FAFAF8;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">
      <tr><td style="background:#1A1A1A;padding:24px 40px;text-align:center;">
        <a href="${SITE_URL}" style="font-family:Georgia,serif;font-size:18px;color:#C4A265;text-decoration:none;letter-spacing:0.1em;">MONA NIKO GALLERY</a>
      </td></tr>
      <tr><td style="background:#C4A265;height:3px;"></td></tr>
      <tr><td style="padding:40px;">
        <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#1A1A1A;margin:0 0 8px;">You've Been Outbid</h1>
        <p style="font-size:15px;color:#4A4A4A;margin:0 0 28px;line-height:1.6;">
          Dear ${data.bidderName}, someone has placed a higher bid on <strong>${data.artworkTitle}</strong>.
        </p>
        <div style="background:#FAFAF8;border:1px solid #E8E5E0;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#4A4A4A;">Your Bid</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#6B6560;text-decoration:line-through;">$${data.previousBid.toLocaleString()}</p>
          <p style="margin:8px 0 0;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#4A4A4A;">Current Highest Bid</p>
          <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:28px;color:#C4A265;">$${data.newBid.toLocaleString()}</p>
        </div>
        <p style="font-size:14px;color:#4A4A4A;margin:0 0 24px;">Auction closes: <strong>${endDate}</strong></p>
        <a href="${auctionUrl}" style="display:inline-block;background:#C4A265;color:#fff;text-decoration:none;padding:14px 32px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;">
          Place a Higher Bid
        </a>
      </td></tr>
      <tr><td style="background:#2C2C2C;padding:20px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#C5C0B8;">Mona Niko Gallery · 668B The Shops at Mission Viejo Mall · Mission Viejo, CA 92691</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`

  const resendClient = new Resend(process.env.RESEND_API_KEY || '')
  return resendClient.emails.send({
    from: FROM,
    to: data.bidderEmail,
    subject: `You've been outbid on "${data.artworkTitle}" — Bid Now`,
    html,
  })
}

// ─── Auction: Winner Notification ──────────────────────────────
export async function sendAuctionWon(data: {
  winnerName: string
  winnerEmail: string
  artworkTitle: string
  winningBid: number
  auctionSlug: string
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monaniko.com'
  const FROM = `${process.env.FROM_NAME || 'Mona Niko Gallery'} <${process.env.FROM_EMAIL || 'noreply@monaniko.com'}>`
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@monaniko.com'

  const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FAFAF8;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">
      <tr><td style="background:#1A1A1A;padding:24px 40px;text-align:center;">
        <a href="${SITE_URL}" style="font-family:Georgia,serif;font-size:18px;color:#C4A265;text-decoration:none;letter-spacing:0.1em;">MONA NIKO GALLERY</a>
      </td></tr>
      <tr><td style="background:#C4A265;height:3px;"></td></tr>
      <tr><td style="padding:48px 40px;text-align:center;">
        <div style="font-size:40px;margin-bottom:16px;">🏆</div>
        <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#1A1A1A;margin:0 0 8px;">Congratulations!</h1>
        <p style="font-size:16px;color:#4A4A4A;margin:0 0 32px;line-height:1.6;">
          Dear ${data.winnerName}, you have won the auction for <strong>${data.artworkTitle}</strong>.
        </p>
        <div style="background:#FAFAF8;border:1px solid #C4A265;padding:24px;margin-bottom:32px;text-align:left;">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#4A4A4A;">Your Winning Bid</p>
          <p style="margin:0;font-family:Georgia,serif;font-size:36px;color:#C4A265;">$${data.winningBid.toLocaleString()}</p>
        </div>
        <p style="font-size:14px;color:#4A4A4A;line-height:1.8;margin:0 0 32px;text-align:left;">
          Our team will be in touch within 24 hours to arrange payment and shipping for your artwork.
          We're thrilled to connect you with this original work by Mona Niko.
        </p>
        <a href="mailto:${ADMIN_EMAIL}" style="display:inline-block;background:#1A1A1A;color:#fff;text-decoration:none;padding:14px 32px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;">
          Contact Gallery
        </a>
      </td></tr>
      <tr><td style="background:#2C2C2C;padding:20px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#C5C0B8;">Mona Niko Gallery · 668B The Shops at Mission Viejo Mall · Mission Viejo, CA 92691</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`

  const resendClient = new Resend(process.env.RESEND_API_KEY || '')
  return resendClient.emails.send({
    from: FROM,
    to: data.winnerEmail,
    bcc: ADMIN_EMAIL,
    subject: `You Won! — "${data.artworkTitle}" | Mona Niko Gallery`,
    html,
  })
}

// ─── Auction: New Bid Admin Notification ───────────────────────
export async function sendAuctionNewBid(data: {
  bidderName: string
  bidderEmail: string
  artworkTitle: string
  amount: number
  auctionId: string
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monaniko.com'
  const FROM = `${process.env.FROM_NAME || 'Mona Niko Gallery'} <${process.env.FROM_EMAIL || 'noreply@monaniko.com'}>`
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@monaniko.com'

  const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FAFAF8;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">
      <tr><td style="background:#1A1A1A;padding:24px 40px;text-align:center;">
        <span style="font-family:Georgia,serif;font-size:18px;color:#C4A265;letter-spacing:0.1em;">MONA NIKO GALLERY — ADMIN</span>
      </td></tr>
      <tr><td style="background:#C4A265;height:3px;"></td></tr>
      <tr><td style="padding:32px 40px;">
        <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:400;color:#1A1A1A;margin:0 0 20px;">New Auction Bid</h1>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            ['Artwork', data.artworkTitle],
            ['Bidder', data.bidderName],
            ['Email', data.bidderEmail],
            ['Bid Amount', '$' + data.amount.toLocaleString()],
          ].map(([k, v]) => `<tr>
            <td style="padding:8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#4A4A4A;width:120px;vertical-align:top;">${k}</td>
            <td style="padding:8px 0;font-size:15px;color:#1A1A1A;font-weight:${k === 'Bid Amount' ? '600' : '400'};">${v}</td>
          </tr>`).join('')}
        </table>
        <a href="${SITE_URL}/admin/auctions" style="display:inline-block;margin-top:24px;background:#C4A265;color:#fff;text-decoration:none;padding:12px 24px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">
          View in Admin
        </a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`

  const resendClient = new Resend(process.env.RESEND_API_KEY || '')
  return resendClient.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New bid $${data.amount.toLocaleString()} on "${data.artworkTitle}"`,
    html,
  })
}
