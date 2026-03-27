export interface HelpItem {
  heading: string;
  text: string;
}

export interface PageHelp {
  title: string;
  description: string;
  workflow: HelpItem[];
  logic: HelpItem[];
  technical: HelpItem[];
}

export const adminHelp: Record<string, PageHelp> = {
  "/admin": {
    title: "Dashboard",
    description: "Your command center — real-time KPIs, revenue trends, and activity feed for the gallery.",
    workflow: [
      { heading: "Daily routine", text: "Start here every morning. Scan KPI cards for anomalies (orders, revenue, new subscribers). Check the recent activity feed for overnight events — new orders, inquiries, auction bids." },
      { heading: "Weekly review", text: "Compare this week's revenue vs. last week in the analytics mini-chart. Identify top-performing artworks or products driving conversions and consider featuring them on the homepage." },
      { heading: "Action items", text: "Unread inquiries show a badge — resolve them within 24 h for best collector experience. Pending orders should be fulfilled and marked shipped before EOD." },
    ],
    logic: [
      { heading: "KPI calculation", text: "Revenue is the sum of all completed/paid orders in the current calendar month. Order count includes all statuses. Subscribers counts active (non-unsubscribed) records in the Subscriber table." },
      { heading: "Activity feed", text: "The feed is generated from the ActivityLog table, ordered by createdAt descending. Each admin action (artwork created, order fulfilled, etc.) writes a log entry automatically via API middleware." },
      { heading: "Chart data", text: "Revenue chart aggregates orders by day using SQLite date functions. The sparkline reflects the last 30 days of paid order totals, giving a trend signal rather than an exact figure." },
    ],
    technical: [
      { heading: "API endpoints", text: "GET /api/analytics/summary — returns { revenue, orders, subscribers, artworks }. GET /api/activity-log?limit=20 — returns recent log entries. Both are protected by requireAuth()." },
      { heading: "DB tables", text: "Order, Subscriber, Artwork, ActivityLog. The dashboard query joins Order with createdAt filters and uses COUNT/SUM aggregations. SQLite handles ~1M rows without indexing issues for this scale." },
      { heading: "Caching", text: "No server-side cache — data is fetched fresh on each page load. If performance degrades add a Redis TTL of 60 s on the summary endpoint. Next.js ISR is not applicable since this is a client component." },
    ],
  },

  "/admin/artworks": {
    title: "Artworks",
    description: "Manage the gallery's original painting inventory — CRUD, status tracking, pricing, and collection assignment.",
    workflow: [
      { heading: "Adding new artwork", text: "Click 'New Artwork'. Upload the primary image (Cloudinary auto-optimizes). Fill title, medium, dimensions, year, price. Set status to 'Available' unless it's a commission or exhibition piece. Assign to a collection for discoverability." },
      { heading: "Status lifecycle", text: "Available → On Exhibition → Sold. For commissions in progress use 'Reserved'. 'Sold' artworks remain visible in the gallery with a sold badge — this preserves SEO and collector history. Never delete sold artworks." },
      { heading: "Featuring artworks", text: "Toggle 'Featured' to surface the piece on the homepage hero carousel and gallery landing. Aim for 5–8 featured artworks at any time. Rotate seasonally to keep the homepage fresh." },
    ],
    logic: [
      { heading: "Slug generation", text: "Slug is auto-generated from the title using slugify() on save. It is used as the URL path /gallery/[slug]. Changing the title after publishing will change the URL and break existing links — update with caution." },
      { heading: "Price vs. inquiry", text: "If priceOnInquiry is true, the price field is hidden on the public page and replaced with a 'Contact for pricing' CTA. Use this for high-value or NFS pieces. PriceOnInquiry overrides any price value." },
      { heading: "Collection assignment", text: "One artwork can belong to one collection. The collectionId FK links to Collection. The collection page dynamically renders all artworks with matching collectionId. Featured artworks appear first." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/artworks, PATCH/DELETE /api/artworks/[id]. Images stored in Cloudinary under folder 'artworks/'. The images field in DB is a JSON string array — parsed with safeJson() on GET responses." },
      { heading: "Image upload flow", text: "POST /api/upload with multipart/form-data. Cloudinary returns secure_url and public_id. The public_id is stored for future deleteImage() calls. Max upload size: 10 MB. Formats: jpg, png, webp." },
      { heading: "DB schema", text: "Artwork model: id(cuid), title, slug(unique), description, images(JSON string), category(enum), medium(enum), dimensions(JSON string), year, status(enum), price, priceOnInquiry, collectionId(FK), tags(JSON string), featured, framing, certificate." },
    ],
  },

  "/admin/collections": {
    title: "Collections",
    description: "Curate thematic groups of artworks into named collections shown on the Collections page.",
    workflow: [
      { heading: "Creating a collection", text: "Define a strong theme before creating. Write a 2–3 sentence description that speaks to the emotional and cultural narrative. Upload a striking cover image (landscape orientation works best). Assign artworks via artwork management." },
      { heading: "Cover image strategy", text: "The cover image represents the entire collection in grid views. Choose the most iconic or recognizable artwork image. It should read well at 400 × 300 px thumbnail size." },
      { heading: "Featured collections", text: "Toggle featured to show the collection in the homepage Collections section. Maximum 3 featured collections for visual balance." },
    ],
    logic: [
      { heading: "Artwork membership", text: "Artworks belong to a collection via the Artwork.collectionId FK. A collection has no direct child list — it is computed by querying artworks WHERE collectionId = id. This means reordering artworks requires sorting by year or featured flag." },
      { heading: "Slug uniqueness", text: "Collection slugs must be unique. The route /collections/[slug] uses generateStaticParams for SSG — changing a slug requires a new build to update static pages." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/collections, PATCH/DELETE /api/collections/[id]. Collection data is joined with artwork count in the GET all response for the admin table." },
      { heading: "SEO", text: "Each collection detail page has generateMetadata returning title, description, and OpenGraph image from the coverImage field. JSON-LD BreadcrumbList is injected server-side." },
    ],
  },

  "/admin/journal": {
    title: "Journal Posts",
    description: "Manage the studio journal/blog — publish articles about process, exhibitions, inspiration, and collector insights.",
    workflow: [
      { heading: "Writing workflow", text: "Draft in the content field using Markdown. Save as 'draft' to preview before publishing. Set publishedAt to a future date for scheduled publishing (the content scheduler can handle this). Always fill the excerpt — it shows in listing cards and meta descriptions." },
      { heading: "Categories", text: "Use consistent categories: Studio Diary (process/technique), Reflections (inspiration/culture), Collector's Corner (buying guide/care), Workshops (event recaps), Exhibitions (show coverage). This enables filtered browsing." },
      { heading: "Cover images", text: "Landscape images at 16:9 or 3:2 ratio work best for the hero. Use artwork images for art-focused posts, studio photography for behind-the-scenes pieces." },
    ],
    logic: [
      { heading: "Publish status", text: "Status enum: draft | published | archived. Only published posts appear on the public /journal page. Archived posts are hidden but retained for analytics history. Draft posts are accessible via direct URL if you know the slug." },
      { heading: "SEO fields", text: "The seo.title overrides the post title in <title> tags. The seo.description is used as the meta description and OG description. If omitted, the excerpt is used as fallback." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/journal, PATCH/DELETE /api/journal/[id]. Public API filters WHERE status = 'published' AND publishedAt <= NOW(). Admin API returns all statuses." },
      { heading: "Content rendering", text: "The content field is raw Markdown stored as a string in SQLite. The client-side JournalDetailContent.tsx renders it with a Markdown parser. Code blocks, images, and headings are all supported." },
      { heading: "Static generation", text: "Journal detail pages use generateStaticParams + ISR (revalidate: 3600). After publishing a new post, trigger a revalidation or wait up to 1 hour for it to appear in static builds." },
    ],
  },

  "/admin/press": {
    title: "Press",
    description: "Manage press features, media coverage, and exhibition mentions that appear on the Press page.",
    workflow: [
      { heading: "Adding press items", text: "Enter the publication name, article title, publication date, and a direct URL to the article. Write a 1–2 sentence excerpt that captures the article's tone. Upload the publication logo for visual credibility." },
      { heading: "Featuring coverage", text: "Featured press items appear prominently in the About page press strip and the Press page hero. Select 3–5 high-profile placements for feature status." },
    ],
    logic: [
      { heading: "Display order", text: "Press items are sorted by publishedAt descending (newest first). Featured items are pulled to the top of the list. Use the publishedAt date from the actual article, not the date you entered it." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/press, PATCH/DELETE /api/press/[id]. PressItem model: id, title, publication, publishedAt, url, excerpt, logo, featured." },
    ],
  },

  "/admin/products": {
    title: "Products",
    description: "Manage the shop inventory — merchandise, prints, limited editions, and designers collection items.",
    workflow: [
      { heading: "Product types", text: "Products have four types: merchandise (phone cases, cushions, ties, etc.), print (limited edition giclées), designers_collection (clothing), and original (direct-sale originals). The type determines which shop sub-page it appears on." },
      { heading: "Variants", text: "Add variants for size/model variations. Each variant has its own price, stock, and optional dimension. When a customer adds to cart they select a variant. Variants without stock show as 'Sold Out' (not hidden)." },
      { heading: "Linking to artworks", text: "Set artworkId to connect a product (e.g. phone case, print) to its source artwork. This enables cross-selling — the artwork detail page shows related products." },
    ],
    logic: [
      { heading: "shopCategory routing", text: "The shopCategory field determines the URL sub-path: merch_phone_case → /shop/merch, print_limited_edition → /shop/prints, designers_collection → /shop/designers. Products only appear on their assigned sub-page." },
      { heading: "Stock management", text: "Stock is decremented on successful Stripe webhook (order paid). If stock reaches 0, the variant shows as unavailable. There is no automatic restock — update stock manually when inventory arrives." },
      { heading: "basePrice", text: "basePrice is the lowest variant price, used for display in listing grids. It is set manually — if you update variant prices, remember to update basePrice to match the cheapest variant." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/products, PATCH/DELETE /api/products/[id]. ProductVariant is nested in the Product response. Variant stock updates happen via PATCH /api/products/[id] with the updated variants array." },
      { heading: "Cart & Stripe", text: "When a customer checks out, the cart sends variantId + quantity to POST /api/checkout which creates a Stripe PaymentIntent. The webhook at /api/stripe/webhook handles payment confirmation and stock decrement." },
      { heading: "Images", text: "Product images (Cloudinary URLs or local /public paths) are stored as a JSON string array in the DB. The first image is the primary thumbnail. Multiple images enable a gallery carousel on the product detail page." },
    ],
  },

  "/admin/workshops": {
    title: "Workshops",
    description: "Manage workshop events — schedule, pricing, capacity, instructor, and booking flow.",
    workflow: [
      { heading: "Creating a workshop", text: "Set the date, time, duration, and location carefully — these are shown directly to customers. Set capacity based on physical space (12 is typical for painting workshops). spotsLeft is decremented on each booking." },
      { heading: "Instructor field", text: "Use the instructor's exact name as they want it displayed publicly. Guest instructors (Reza, Foujan, Eliane, Niloo) have their names shown on the workshop card and booking page." },
      { heading: "Online workshops", text: "Toggle isOnline to true for Zoom-based classes. Location becomes 'Online via Zoom'. The confirmation email includes the Zoom link from the settings (configure under Settings → Integrations)." },
    ],
    logic: [
      { heading: "Spots management", text: "spotsLeft is manually managed — it does not auto-decrement from Stripe. After receiving a workshop booking payment webhook, manually reduce spotsLeft. An automated decrement system is on the product roadmap." },
      { heading: "Level enum", text: "Level options: beginner | intermediate | advanced | all_levels. 'all_levels' is the most common. This appears as a badge on the workshop card to help customers self-select." },
      { heading: "Materials list", text: "The materials array lists what is provided. Workshop confirmation emails include this list. If materials are included in the price, state 'All materials provided' explicitly in the description." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/workshops, PATCH/DELETE /api/workshops/[id]. Workshop model has date(ISO string), time(string), isOnline(bool), instructor(string), level(enum), materials(array stored as JSON string)." },
      { heading: "Booking email", text: "sendWorkshopBookingEmail() in lib/resend.ts fires on Stripe webhook when the order productType is 'workshop'. It sends confirmation to the customer with date, time, location, and materials list." },
      { heading: "Static generation", text: "Workshop detail pages use generateStaticParams. After adding a new workshop, trigger ISR revalidation or wait for the next build cycle. The workshop slug must be unique." },
    ],
  },

  "/admin/orders": {
    title: "Orders",
    description: "View and manage all customer orders — artwork purchases, print sales, merchandise, and workshop bookings.",
    workflow: [
      { heading: "Order lifecycle", text: "pending → paid → fulfilled → shipped → delivered. Orders are created as 'pending' when PaymentIntent is created. Stripe webhook moves them to 'paid'. You manually update to fulfilled/shipped/delivered as you pack and ship." },
      { heading: "Daily processing", text: "Filter by 'paid' status each morning. For art/print orders: pack, generate shipping label, enter tracking number, update status to 'shipped'. For workshop orders: mark 'fulfilled' and ensure customer received confirmation email." },
      { heading: "Refunds", text: "For refunds, process through the Stripe Dashboard directly (not implemented in admin UI). Then manually update order status to 'refunded' and note the reason in the order notes field." },
    ],
    logic: [
      { heading: "Order sources", text: "Orders are created by the POST /api/checkout endpoint when a Stripe PaymentIntent succeeds. The shippingAddress is stored as a JSON string from the checkout form. The line items are stored in OrderItem records." },
      { heading: "Customer linking", text: "If the customer was logged in during checkout, the order links to their account (customerId FK). Guest orders have customerId = null. Linked orders appear in the customer's /account/orders page." },
      { heading: "Email triggers", text: "Order confirmation email (sendOrderConfirmationEmail) fires immediately on the Stripe webhook paid event. If the email fails, it is not retried — check Resend logs at resend.com/emails." },
    ],
    technical: [
      { heading: "API", text: "GET /api/orders (admin, all orders), GET /api/account/orders (customer, their orders only). PATCH /api/orders/[id] updates status, trackingNumber, notes. Order model: id, customerId(FK nullable), items(OrderItem[]), total, status, shippingAddress(JSON), stripePaymentIntentId." },
      { heading: "Stripe webhook", text: "POST /api/stripe/webhook validates the Stripe-Signature header with STRIPE_WEBHOOK_SECRET. On payment_intent.succeeded: creates Order record, creates OrderItem records, sends confirmation email, updates stock." },
      { heading: "Filtering & pagination", text: "Uses parsePagination() from lib/api-utils.ts. Supports ?status=paid&page=1&limit=20. The admin orders table supports client-side filtering by status and date range without additional API calls." },
    ],
  },

  "/admin/promo-codes": {
    title: "Promo Codes",
    description: "Create and manage discount codes for checkout — percentage, fixed amount, or free shipping.",
    workflow: [
      { heading: "Creating a code", text: "Click New Promo Code. Enter the code (uppercase, no spaces, e.g. SUMMER20). Set discount type: percentage (20 = 20% off) or fixed (20 = $20 off). Set expiry date and usage limit to control distribution." },
      { heading: "Distribution", text: "Share codes via email blasts, social media, or in-gallery handouts. For VIP collectors, create single-use codes with usageLimit = 1 for an exclusive feel." },
      { heading: "Monitoring", text: "The usageCount column increments each time a valid code is applied at checkout. Track which codes drive the most conversions and repeat successful campaigns." },
    ],
    logic: [
      { heading: "Validation", text: "Codes are validated at POST /api/promo-codes/validate. Checks: code exists, isActive = true, expiresAt > now, usageCount < usageLimit (if set). The validated discount is applied to the Stripe PaymentIntent amount." },
      { heading: "Minimum order", text: "The minimumOrder field (if set) requires the cart subtotal to meet a threshold before the code applies. Useful for 'Spend $500 get 15% off' promotions." },
      { heading: "Stack prevention", text: "Only one promo code can be applied per order. The checkout form clears any previously entered code when a new one is validated." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/promo-codes, PATCH/DELETE /api/promo-codes/[id]. POST /api/promo-codes/validate (public endpoint, rate-limited by IP in production). PromoCode model: code(unique), discountType(enum), discountValue, minimumOrder, usageLimit, usageCount, expiresAt, isActive." },
      { heading: "Stripe integration", text: "The validated discount is applied client-side by recalculating the total and creating/updating the PaymentIntent with the discounted amount. The promo code ID is stored in order metadata for reporting." },
    ],
  },

  "/admin/campaigns": {
    title: "Campaigns",
    description: "Plan and track marketing campaigns — channel targeting, budget, timeline, and performance metrics.",
    workflow: [
      { heading: "Campaign planning", text: "Create a campaign for each major initiative: gallery opening, seasonal sale, new collection launch, workshop series. Define channels (email, instagram, in-store), set budget, and write goals before launch." },
      { heading: "Tracking performance", text: "Update the metrics JSON after each campaign ends: reach, impressions, clicks, conversions, revenue. Use these figures to calculate ROI and inform the next campaign's budget allocation." },
      { heading: "Target segments", text: "Use targetSegments to align the campaign with specific audience groups (collectors, workshop participants, local art lovers). This feeds into email blast audience filtering in the Marketing section." },
    ],
    logic: [
      { heading: "Status flow", text: "Status: draft → active → paused → completed. Active campaigns should have a start date ≤ today ≤ end date. Completed campaigns retain their metrics for historical reporting." },
      { heading: "Channels vs. blasts", text: "The channels field is informational — it documents which platforms you're using. Actual email sends happen via Email Blasts (Marketing section). Connect blasts to a campaign by selecting the campaign in the blast creation form." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/campaigns, PATCH/DELETE /api/campaigns/[id]. Campaign model: channels(JSON array), targetSegments(JSON array), metrics(JSON object) — all stored as strings in SQLite, parsed with safeJson() on read." },
      { heading: "Metrics schema", text: "metrics JSON: { reach: number, impressions: number, clicks: number, conversions: number, revenue: number }. Update via PATCH with the full metrics object. No partial updates — send the complete object each time." },
    ],
  },

  "/admin/marketing/blasts": {
    title: "Email Blasts",
    description: "Send bulk email campaigns to your subscriber list using pre-built or custom templates.",
    workflow: [
      { heading: "Creating a blast", text: "Select a template (or write custom HTML). Set the subject line — this is the most important factor for open rate. Choose an audience segment or send to all active subscribers. Schedule or send immediately." },
      { heading: "Before sending", text: "Always preview the email in the template editor first. Check that merge tags ({{firstName}}, {{galleryName}}) resolve correctly. Verify the unsubscribe link is present (required by CAN-SPAM). Send a test to yourself." },
      { heading: "Post-send", text: "Monitor delivery in the Resend dashboard (resend.com/emails). Track open and click rates. Unsubscribes are processed automatically — Resend webhooks update subscriber records in the DB." },
    ],
    logic: [
      { heading: "Batch sending", text: "sendEmailBlast() chunks the subscriber list into batches of 100 and sends via Resend batch API to avoid rate limits. For lists > 1000, the send may take 30–60 seconds. The UI shows a loading state during this time." },
      { heading: "Segment filtering", text: "Segments are stored as JSON arrays on Subscriber records. Filtering by segment queries Subscribers WHERE JSON_CONTAINS(segments, segment_name). Active subscribers only (unsubscribedAt IS NULL)." },
      { heading: "Status tracking", text: "Blast status: draft → scheduled → sending → sent | failed. If sending fails mid-batch, status is set to 'failed' and the error is logged. Partial sends are not retried automatically." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/marketing/blasts, POST /api/marketing/blasts/[id]/send. Send endpoint calls sendEmailBlast() from lib/resend.ts. Resend API key must be set in .env as RESEND_API_KEY." },
      { heading: "Resend limits", text: "Free tier: 100 emails/day, 3000/month. Paid tier: higher limits. For galleries sending weekly newsletters to 500+ subscribers, the Starter plan ($20/month) is recommended. Check resend.com/pricing." },
      { heading: "Email model", text: "EmailBlast model: subject, templateId(FK), audienceSegment, status, sentAt, recipientCount, openRate, clickRate. Rates are updated via Resend webhook events (not yet implemented — manual entry for now)." },
    ],
  },

  "/admin/marketing/templates": {
    title: "Email Templates",
    description: "Build reusable HTML email templates for newsletters, promotions, and automated notifications.",
    workflow: [
      { heading: "Template structure", text: "Write templates in HTML with inline CSS (required for email clients). Use {{variable}} merge tags for personalization: {{firstName}}, {{galleryName}}, {{year}}. Keep width ≤ 600px for compatibility." },
      { heading: "Template types", text: "Create separate templates for: newsletter (monthly), promotion (sale/event), new artwork announcement, workshop reminder, collection launch. This allows each blast to have the right visual tone." },
      { heading: "Testing", text: "Test your template HTML at https://putsmail.com or Litmus before using in a blast. Common issues: Gmail clips emails > 102KB, Outlook ignores many CSS properties, background images require special handling." },
    ],
    logic: [
      { heading: "Merge tag resolution", text: "Merge tags are replaced server-side in sendEmailBlast() before each email is sent. Currently supported: {{firstName}}, {{email}}, {{galleryName}}, {{year}}, {{unsubscribeUrl}}. Custom tags require code changes in lib/resend.ts." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/marketing/templates, PATCH/DELETE /api/marketing/templates/[id]. EmailTemplate model: name, subject(default), htmlContent, textContent(optional plain-text fallback), category." },
      { heading: "HTML storage", text: "htmlContent is stored as plain text in SQLite (TEXT column). There is no HTML sanitization on storage — only on render. Validate your HTML carefully before saving to avoid broken templates." },
    ],
  },

  "/admin/content": {
    title: "Content Scheduler",
    description: "Schedule future content publications — journal posts, social media, and gallery announcements.",
    workflow: [
      { heading: "Scheduling content", text: "Create a scheduled item with content type, target date/time, and the content body or a reference to the item to publish. The scheduler checks for due items on a configurable interval." },
      { heading: "Content types", text: "Supported types: journal_post (auto-publishes draft posts), announcement (gallery notice), social_post (caption ready for manual posting). Future integrations may include automatic social publishing." },
    ],
    logic: [
      { heading: "Publish trigger", text: "Content scheduling currently requires a cron job or manual trigger to check for due items. In production, set up a Vercel cron job at POST /api/cron/publish-scheduled running every 15 minutes." },
      { heading: "Status", text: "Status: scheduled → processing → published | failed. Failed items retain their content for manual intervention." },
    ],
    technical: [
      { heading: "DB model", text: "ScheduledContent: id, type(enum), scheduledAt, status, content(JSON text), relatedId(FK to journal post or other entity). The relatedId approach allows scheduling publish operations on existing drafts." },
      { heading: "Cron setup", text: "Add to vercel.json: { 'crons': [{ 'path': '/api/cron/publish-scheduled', 'schedule': '*/15 * * * *' }] }. The cron endpoint must verify a CRON_SECRET header to prevent unauthorized triggers." },
    ],
  },

  "/admin/audience": {
    title: "Audience",
    description: "Manage subscriber list, view demographics, and segment contacts for targeted marketing.",
    workflow: [
      { heading: "List hygiene", text: "Regularly archive subscribers who haven't opened emails in 6+ months. This improves deliverability rates. Export the full list monthly as a CSV backup (use browser's export or direct DB query)." },
      { heading: "Segments", text: "Segments are JSON arrays on Subscriber records. Assign segments like 'collector', 'workshop-participant', 'newsletter-only'. Then target email blasts to specific segments for relevance." },
      { heading: "Manual additions", text: "Add subscribers collected in-gallery (paper sign-ups, show attendees) by clicking New Subscriber. Get consent before adding — CAN-SPAM and GDPR require opt-in." },
    ],
    logic: [
      { heading: "Unsubscribe flow", text: "The unsubscribe link in every email points to /api/email/unsubscribe?token=[token]. This sets unsubscribedAt = now on the Subscriber record. Unsubscribed contacts are excluded from all blast sends automatically." },
      { heading: "Subscriber sources", text: "Sources: newsletter_form (homepage signup), checkout (opted in at purchase), workshop_booking, manual. This helps track which acquisition channel drives the most engaged subscribers." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/subscribers, PATCH/DELETE /api/subscribers/[id]. GET supports ?segment=collector&page=1&limit=50. Subscriber model: email(unique), firstName, lastName, segments(JSON array), source, subscribedAt, unsubscribedAt." },
      { heading: "Email validation", text: "Email uniqueness is enforced at DB level (unique index on email). Attempting to add a duplicate email returns a 409 Conflict. The newsletter signup form also validates format on the client before sending." },
    ],
  },

  "/admin/inquiries": {
    title: "Inquiries",
    description: "Manage inbound artwork inquiries from collectors — track status, respond, and convert to sales.",
    workflow: [
      { heading: "Response SLA", text: "Aim to respond to all inquiries within 24 hours. Serious collector inquiries should be escalated and responded to within 4 hours. The inquiry source (from which artwork/page) indicates intent level." },
      { heading: "Status progression", text: "new → read → responded → converted | closed. Mark as 'read' immediately when you open it. Mark 'responded' after sending your reply. Mark 'converted' if the inquiry leads to a sale. This tracks your conversion rate." },
      { heading: "Responding", text: "Reply directly via email (the customer's email is in the inquiry record). Update the status after responding. Add internal notes for CRM context — what pricing was discussed, what the customer's interest level was." },
    ],
    logic: [
      { heading: "Inquiry creation", text: "Inquiries are created via POST /api/inquiries from the public contact/artwork page. The email notification (sendInquiryEmail) fires immediately to the gallery's admin email. The inquiry is stored in the DB for tracking." },
      { heading: "Artwork linking", text: "If an inquiry comes from an artwork detail page, artworkId is set. This allows filtering inquiries by artwork to see demand patterns — which artworks attract the most collector interest." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/inquiries, PATCH /api/inquiries/[id]. Inquiry model: name, email, message, artworkId(FK nullable), status(enum), notes, createdAt." },
      { heading: "Email notification", text: "sendInquiryEmail() sends to the ADMIN_EMAIL env var (configure in .env). Uses Resend. The email includes the inquiry message and a direct link to the admin inquiries page." },
    ],
  },

  "/admin/commissions": {
    title: "Commissions",
    description: "Manage custom artwork commissions from initial inquiry through 8 stages to delivery and certificate.",
    workflow: [
      { heading: "Commission stages", text: "8-stage workflow: inquiry → consultation → proposal → deposit_paid → in_progress → review → final_payment → delivered. Each stage has specific actions. Move the stage only after completing the stage tasks." },
      { heading: "Stage transitions", text: "inquiry: gather requirements. consultation: discuss vision, dimensions, price. proposal: send formal quote. deposit_paid: receive 50% deposit, begin work. in_progress: create art, share progress photos. review: client approves or requests changes. final_payment: receive balance. delivered: ship/hand over artwork + certificate." },
      { heading: "Certificate generation", text: "After delivery, create a Certificate of Authenticity from the Certificates page, linking it to the commission's artworkId. This adds formal value and collector confidence." },
    ],
    logic: [
      { heading: "Pricing model", text: "Commissions are priced based on dimensions, medium, and complexity. Store the agreed price in the price field after the proposal stage. The deposit is typically 50%, final payment is the remainder." },
      { heading: "Client communication", text: "Use the notes field extensively at each stage — record what was discussed, client feedback, revision requests. This creates an audit trail if disputes arise." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/commissions, PATCH /api/commissions/[id]. Commission model: clientName, clientEmail, description, dimensions, medium, price, depositAmount, stage(enum), artworkId(FK nullable), notes, createdAt." },
      { heading: "Stage enum", text: "Stage values: inquiry, consultation, proposal, deposit_paid, in_progress, review, final_payment, delivered. Update via PATCH { stage: 'in_progress' }. No automatic stage validation — the admin is responsible for correct progression." },
    ],
  },

  "/admin/testimonials": {
    title: "Testimonials",
    description: "Curate collector and workshop testimonials shown on public pages to build social proof.",
    workflow: [
      { heading: "Collecting testimonials", text: "Request testimonials from collectors after artwork delivery and from workshop participants after events. Include a direct ask in the order follow-up email. Always get written permission before publishing." },
      { heading: "Approval workflow", text: "New testimonials default to 'pending'. Review for authenticity and tone. Approve those that are specific and emotive. Reject vague or too-promotional sounding reviews. Feature the strongest 4–6 on the homepage." },
    ],
    logic: [
      { heading: "Display logic", text: "Featured testimonials appear in the homepage testimonials carousel. All approved testimonials appear on the /about page testimonials section, sorted by date descending." },
      { heading: "Rating field", text: "Rating is 1–5. Display only 4+ ratings publicly. A low rating collected in person should be kept private (pending) and used as internal feedback, not published." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/testimonials, PATCH/DELETE /api/testimonials/[id]. Testimonial model: name, role, content, rating, avatarUrl, artworkId(FK nullable), status(enum: pending|approved|rejected), featured." },
    ],
  },

  "/admin/collector-club": {
    title: "Collector Club",
    description: "Manage VIP collector memberships — tiers, benefits, and member engagement tracking.",
    workflow: [
      { heading: "Membership tiers", text: "Three tiers: Patron ($500/yr), Connoisseur ($1200/yr), Luminary (by invitation). Each tier has different benefits: early access, private viewings, studio visits, custom framing discounts." },
      { heading: "Member onboarding", text: "When a new member joins via the website form or in-gallery, manually verify their membership tier and send a welcome email with their member benefits. Assign their membership card (certificate) if applicable." },
      { heading: "KPI tracking", text: "The KPI cards show total members, active members, and revenue by tier. Use these to evaluate program effectiveness and plan exclusive events for members." },
    ],
    logic: [
      { heading: "Membership status", text: "Status: active | expired | cancelled. Expiry is based on memberSince + 365 days for annual memberships. There is no automatic renewal — manually extend or the member must re-join." },
      { heading: "Join form", text: "The public /collector-club page has a join form that POSTs to /api/collector-club. New members start as 'pending' until payment is confirmed. Then manually set to 'active'." },
    ],
    technical: [
      { heading: "API", text: "GET /api/collector-club (admin), POST /api/collector-club (public join form). CollectorMembership model: userId(FK nullable), name, email, tier(enum), status, memberSince, benefits(JSON array), notes." },
    ],
  },

  "/admin/certificates": {
    title: "Certificates",
    description: "Generate and manage Certificates of Authenticity for original artworks — numbered, signed, and printable.",
    workflow: [
      { heading: "Generating certificates", text: "Create a certificate after completing an artwork or commission. Link it to the artwork via artworkId. The certificate number is auto-generated in format MN-YYYY-NNNN (e.g. MN-2024-0042). Print to PDF from the print button." },
      { heading: "Printing", text: "Use the Print to PDF button which opens a clean print layout. Ensure your browser prints at 100% scale (no fit-to-page) for correct sizing. The certificate is designed for A4/Letter paper." },
      { heading: "Distribution", text: "Include the certificate with physical artwork delivery. For digital purchases (prints), email the PDF certificate with the order confirmation. Retain a copy in the admin for your records." },
    ],
    logic: [
      { heading: "Certificate numbering", text: "Auto-generated format: MN-[YEAR]-[4-digit sequence]. The sequence resets each year. Certificate numbers are unique and stored in the DB — no duplicates possible due to the unique constraint." },
      { heading: "Artwork linkage", text: "The artworkId FK connects the certificate to the artwork. This allows the artwork detail page to show 'Certificate of Authenticity included' when a certificate exists for that artwork." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/certificates, PATCH/DELETE /api/certificates/[id]. Certificate model: certificateNumber(unique, auto-generated), artworkId(FK), collectorName, issuedAt, signedBy, notes." },
      { heading: "PDF generation", text: "Print-to-PDF uses the browser's native print dialog with a print.css stylesheet that hides admin chrome and applies certificate styling. No server-side PDF library is needed — the browser handles rendering." },
    ],
  },

  "/admin/auctions": {
    title: "Auctions",
    description: "Manage live and upcoming artwork auctions — bidding, countdown timers, and winner notifications.",
    workflow: [
      { heading: "Creating an auction", text: "Link the auction to an available artwork. Set startingPrice (minimum first bid), reservePrice (minimum winning price — hidden from bidders), bidIncrement (minimum bid raise), and startAt/endAt times." },
      { heading: "Going live", text: "Click 'Go Live' to change status from scheduled to active. The auction becomes visible on /auctions and the countdown timer starts. Monitor the bid history in real-time via the bid history drawer." },
      { heading: "Ending an auction", text: "Click 'End Auction' (or wait for automatic end at endAt). The highest bid above reservePrice wins. The sendAuctionWon email fires to the winner, sendAuctionOutbid to all non-winning bidders. Update the artwork status to 'sold'." },
    ],
    logic: [
      { heading: "Bid validation", text: "POST /api/auctions/[id]/bid validates: auction is active, endAt is in the future, bid amount ≥ currentHighestBid + bidIncrement, bidder email is provided. Invalid bids return 400 with a descriptive error." },
      { heading: "Outbid notification", text: "When a new highest bid is placed, sendAuctionOutbid() fires to the previous highest bidder. This drives urgency and encourages re-bidding. It uses the bidder's email from the bid record." },
      { heading: "Reserve price", text: "If the winning bid is below the reservePrice, the auction ends without a sale. The winner is notified the reserve was not met. This protects the artist from underselling." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/auctions (admin CRUD), POST /api/auctions/[id]/bid (public), POST /api/auctions/[id]/end (admin). Auction model: artworkId(FK), startingPrice, reservePrice, bidIncrement, currentHighestBid, currentHighestBidderId, status(enum), startAt, endAt." },
      { heading: "Real-time updates", text: "The public auction detail page polls GET /api/auctions/[id] every 10 seconds to show current bid. No WebSocket — polling is sufficient for low-traffic gallery auctions. For high-traffic auctions, consider Server-Sent Events." },
      { heading: "Email functions", text: "sendAuctionWon(), sendAuctionOutbid(), sendAuctionNewBid() in lib/resend.ts. NewBid fires to the gallery admin on each new bid. Won/Outbid fire when the auction ends via POST /api/auctions/[id]/end." },
    ],
  },

  "/admin/accounting": {
    title: "Accounting (P&L)",
    description: "Profit & loss overview — revenue from orders, expense tracking, and net income calculation.",
    workflow: [
      { heading: "Monthly review", text: "At month end, review the P&L summary. Revenue is auto-populated from completed orders. Ensure all expenses for the month are entered (materials, rent allocation, shipping, marketing spend). Net income = Revenue − Expenses." },
      { heading: "Expense entry", text: "Enter expenses under the Expenses sub-page as they occur. Categorize accurately (materials, rent, marketing, equipment, utilities) for tax preparation and business analysis." },
      { heading: "Invoice management", text: "For B2B sales (corporate art, interior designers), create an Invoice and share the PDF link. Track payment status on each invoice." },
    ],
    logic: [
      { heading: "Revenue calculation", text: "Revenue = SUM of Order.total WHERE status IN (paid, fulfilled, shipped, delivered) AND createdAt BETWEEN period_start AND period_end. Refunded orders are excluded (status = refunded)." },
      { heading: "Period filtering", text: "The P&L page defaults to the current month. Use the date range pickers to view quarterly or annual summaries. The chart shows daily revenue for the selected period." },
    ],
    technical: [
      { heading: "API", text: "GET /api/accounting/summary?from=2024-01-01&to=2024-12-31 — returns { revenue, expenses, netIncome, orderCount }. Expenses: GET/POST /api/accounting/expenses, GET/POST /api/accounting/invoices." },
      { heading: "DB models", text: "Expense: amount, category(enum), description, date, receiptUrl. Invoice: clientName, clientEmail, lineItems(JSON array), total, status(enum: draft|sent|paid|overdue), issuedAt, dueAt." },
      { heading: "PDF invoices", text: "Invoice print-to-PDF uses the same browser print approach as Certificates. The invoice template includes line items, totals, gallery address, and payment instructions. No server PDF library needed." },
    ],
  },

  "/admin/accounting/expenses": {
    title: "Expenses",
    description: "Log and categorize gallery operating expenses for P&L and tax reporting.",
    workflow: [
      { heading: "Logging expenses", text: "Enter each business expense as it occurs. Include: amount, date, category, description, and optional receipt URL (upload to Cloudinary or link to a Drive scan). Consistent entry makes tax time much easier." },
      { heading: "Categories", text: "Use standard categories: materials (paints, canvas, clay), rent, marketing (ads, printed materials), equipment (tools, display hardware), utilities, shipping, professional (accountant, legal), other." },
    ],
    logic: [
      { heading: "Tax deductibility", text: "All expense categories here should be legitimate business expenses. Consult your accountant for California-specific deductions for artists. Keep receipts for all expenses > $75 per IRS guidelines." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/accounting/expenses, PATCH/DELETE /api/accounting/expenses/[id]. Expense model: amount(Float), category(String), description, date(DateTime), receiptUrl(String nullable)." },
    ],
  },

  "/admin/accounting/invoices": {
    title: "Invoices",
    description: "Create professional invoices for B2B art sales, corporate commissions, and designer partnerships.",
    workflow: [
      { heading: "Creating an invoice", text: "Add client name, email, and line items (description + quantity + unit price). The total auto-calculates. Set due date (typically Net 30). Send the invoice PDF link to the client via email." },
      { heading: "Payment tracking", text: "Update status to 'paid' when you receive payment. Set status to 'overdue' if past the due date. Follow up with clients on overdue invoices after 7 and 14 days past due." },
    ],
    logic: [
      { heading: "Line items", text: "lineItems is a JSON array: [{ description, quantity, unitPrice, total }]. Each line total = quantity × unitPrice. Invoice total = sum of all line totals. Tax is not automatically calculated — add a tax line item if applicable." },
    ],
    technical: [
      { heading: "API", text: "GET/POST /api/accounting/invoices, PATCH/DELETE /api/accounting/invoices/[id]. Invoice model: clientName, clientEmail, lineItems(JSON string), total, status(enum), issuedAt, dueAt, notes." },
      { heading: "PDF", text: "Print-to-PDF is browser-native. The invoice detail view has a print-optimized layout. The gallery address and bank details should be set in Settings → Business Info and will appear on the invoice template." },
    ],
  },

  "/admin/analytics": {
    title: "Analytics",
    description: "Visualize website performance, sales trends, audience growth, and marketing effectiveness.",
    workflow: [
      { heading: "Key metrics to monitor", text: "Weekly: gallery page views, shop conversion rate, email open rates. Monthly: revenue by category (originals vs. prints vs. merch), new subscriber growth, inquiry conversion rate. Quarterly: top-performing artworks by inquiry count." },
      { heading: "Using data", text: "High page views on an artwork with zero inquiries = pricing or CTA issue. High inquiry rate on a sold artwork = market demand signal (consider a print or similar commission). Low email open rates = subject line or send-time issue." },
    ],
    logic: [
      { heading: "Data sources", text: "Sales data comes from the Order table. Subscriber growth from Subscriber.subscribedAt. Artwork performance from Inquiry.artworkId counts. For full web analytics (page views, bounce rate), integrate Google Analytics 4 via the Settings page." },
      { heading: "Chart periods", text: "All charts support daily, weekly, and monthly aggregation. The default view is the last 30 days. Date range pickers use ISO string comparison against createdAt fields in SQLite." },
    ],
    technical: [
      { heading: "API", text: "GET /api/analytics/summary (KPIs), GET /api/analytics/revenue-chart?period=30d, GET /api/analytics/top-artworks. All protected by requireAuth(). Data is computed via SQL aggregation queries on each request — no pre-computed cache." },
      { heading: "External analytics", text: "For deeper analytics (user sessions, heatmaps, funnel analysis), integrate Vercel Analytics (built-in for Vercel deployments) or PostHog (open source). Add the script tag to src/app/layout.tsx. Google Analytics 4 tracking ID can be set in Settings → Integrations." },
    ],
  },

  "/admin/settings": {
    title: "Settings",
    description: "Configure gallery information, integrations, email settings, and system preferences.",
    workflow: [
      { heading: "Initial setup", text: "On first launch: set Gallery Name, address, phone, and admin email. Configure Stripe keys (live vs. test). Set the Resend API key for email. Set Cloudinary credentials for image uploads. These are required for core functionality." },
      { heading: "Business info", text: "Gallery name, address, and phone appear on invoices, certificates, and email footers. Keep these up to date — they are pulled dynamically from the Setting table, not hardcoded." },
      { heading: "Social links", text: "Social media URLs (Instagram, Facebook, etc.) are used in the public footer and email templates. Update whenever handles change." },
    ],
    logic: [
      { heading: "Setting storage", text: "Settings are stored as key-value pairs in the Setting table: { key: 'gallery_name', value: 'Mona Niko Gallery' }. The GET /api/settings endpoint returns all settings as a key-value object. Updates via PATCH." },
      { heading: "Sensitive values", text: "API keys (Stripe, Resend, Cloudinary) should be stored in .env, not in the DB Setting table. The Settings page shows fields for these but values come from environment variables. Never commit .env to git." },
    ],
    technical: [
      { heading: "API", text: "GET /api/settings (returns all settings as { key: value } object), PATCH /api/settings (accepts { key: value } pairs to update). Setting model: key(unique), value(String), updatedAt." },
      { heading: "Integrations tab", text: "The Integrations section in Settings shows connection status for Stripe, Resend, and Cloudinary. Status is determined by calling a test endpoint on each service. A green check means the API key is valid and responsive." },
      { heading: "Environment vs DB", text: "Runtime config (API keys) → .env file. Business content (gallery name, address) → Setting DB table. UI preferences (colors, layouts) → not yet implemented — currently hardcoded in Tailwind classes." },
    ],
  },
};
