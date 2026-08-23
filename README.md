# Iyandana Property — design preview

A preview site for **PT Iyan Dana Group** (Iyandana Property), Kesiman Kertalangu,
Denpasar Timur. Property sales and rentals — houses, villas, land, hotels and
commercial — with construction as a second line.

Live preview: <https://iyandanaproperty.vercel.app>
Also at: <https://iyandana.onyxcreative.asia>

(`iyandana-property.vercel.app` was already taken by another Vercel account, so
the project claimed the nearest free name. `SITE_URL` in `src/lib/site.ts` is
the single source for it, and metadata, canonicals, hreflang, the sitemap,
robots.txt, structured data and every WhatsApp message follow from there.)

This is a **design preview**, not a replacement for the client's live site. The
existing domain `iyandanaproperty.com` has not been touched in any way.

---

## Why this preview exists

The current site is not broken. It works, it loads, and the content is there.
The problem is narrower and more expensive than a broken site: **the moment the
page opens, a full-screen promotional overlay for a fast-cash service covers
almost everything.** Someone who arrived to look at a villa has to dismiss an
advert for a different product before they can see a single property.

So the entire proposition of this preview is: **the property comes first.**

- The first thing on screen is a property search, above the fold, on load.
- **Nothing on this site is allowed to cover the viewport.** There is no promo
  modal, no offer overlay, no interstitial, no exit-intent popup. The layer
  scale in `globals.css` deliberately has no slot for one, and the audit suite
  fails the build if anything covers more than half the viewport in the first
  five seconds.
- The one thing that does briefly cover the page is a ~1.15 second entrance
  animation on a full page load. It asks for nothing, waits for nothing, and
  removes itself with a CSS animation that runs even with JavaScript disabled.

---

## Decisions the client should know about

### 1. The financing service is mentioned, but only just

The group also offers asset-backed financing. That service is on this preview in
exactly one place: a short section at the bottom of the **Contact** page. It
states that the service exists and points to WhatsApp.

It deliberately carries **no disbursement timing, no eligibility criteria, no
statement about credit checks, no interest rate, no ceiling, and no figure of
any kind.**

The reason is simple: we do not have the real terms, and consumer-credit claims
in Indonesia are a regulated area. Publishing an invented rate or an invented
turnaround time would expose the business, not help it. If the client wants that
service described properly, they need to supply the actual terms and, ideally,
have them checked before publication.

It is also, on purpose, the shortest section on the site. It is not the reason
someone visits a property agency.

### 2. The existing logo is used as the site icon, and it is worth a conversation

The client's current mark is a grayscale circular badge built around a currency
symbol, on an opaque light square. It is used here as the **site icon**
(`public/brand/`), keyed to a transparent background so it sits correctly on any
browser tab. `scripts/build-brand.mjs` does that automatically from the original
file; nothing about the mark itself was redrawn.

It is **not** used in the site header. The header and the share image use a
typographic wordmark instead.

The reason to raise this with the client: a badge built around a currency symbol
reads as a finance business, which is precisely the association this preview is
trying to move out of the way of the property listings. A refreshed mark would
help. That is a decision for the client, not one to make for them.

### 3. Every listing is sample data, and the site says so

The listings in `src/data/listings.ts` are examples for the purpose of showing
the design. The site marks them as samples on every card, on every detail page,
on the listings index, and in the Terms page.

No precise street address, certificate number or owner name is invented
anywhere. Only area and regency names are used.

When real listings replace them, set `SAMPLE_DATA = false` at the top of
`src/data/listings.ts` and every sample marker disappears site-wide.

### 4. No claims anywhere

There are no ratings, no review counts, no "properties sold", no year founded,
no testimonials, no named agents, no "trusted" or "number one", and no promised
response times. Section titles, page titles and neutral descriptions only.

The construction page does not list past projects, because we do not have any
verified ones. The page says so in plain language rather than inventing a
portfolio.

### 5. The artwork is drawn, not photographed

Every image is a generated SVG from `scripts/lib/tile-art.mjs`. Nothing pretends
to be a photograph of a real building, and no image contains a face. Every alt
text says the image is placeholder artwork. Each property type has its own
composition, so a house, a villa, a plot of land, a hotel, a commercial building
and a construction site are told apart at a glance while still reading as one
family.

Replacing them with real photography later is a matter of swapping the image
paths; the layout reserves the same aspect ratios.

### 6. Light mode only, on purpose

The site commits to one light world and locks `color-scheme: light`. Property
browsing is a daylight, trust-first task, and a single committed palette let
every colour pair be verified rather than doubled. All 27 pairs are checked by
`npm run audit:contrast`.

---

## Editing content

### Listings

**`src/data/listings.ts` is the only file to edit.** It carries a full
explanation of every field in both Indonesian and English at the top. Adding a
listing is a matter of copying an existing block and changing the values.

After adding a listing, run once:

```bash
npm run build:tiles
```

That generates the artwork for the new listing. Then commit and deploy.

### Text

All site copy lives in `src/lib/dictionary.ts`, in both languages side by side.
Both languages are required for every string.

### Company details

Address, phone numbers, WhatsApp number, email and opening hours live in
`src/lib/site.ts`. They feed the footer, the contact page, and the structured
data that search engines read.

---

## Running it

```bash
npm install
npm run dev
```

Rebuilding the generated assets (fonts, brand marks, artwork):

```bash
npm run build:assets
```

The font step needs the licensed Neue Montreal TTFs. It reads them from
`C:/Users/User/Downloads/NEUE MONTREAL` by default; set `NEUE_MONTREAL_DIR` to
point somewhere else. The generated WOFF2 files are committed, so a normal build
never needs the TTFs.

---

## Verifying it

```bash
npm run verify
```

That runs, in order: TypeScript, the contrast audit, a production build, and the
browser audit suite.

The browser suite (`npm run audit`) drives a real Chrome and starts its own
production server. Point it at a deployment instead by passing a URL:

```bash
npm run audit -- https://iyandanaproperty.vercel.app
```

It checks, among other things:

- every route answers 200, with no failed requests and no console errors
- zero broken images
- zero horizontal overflow at 375, 768 and 1440, naming any offending element,
  including a case with a deliberately extreme listing title
- nothing covers the front page between 1.5 and 5 seconds, and the hero search
  is clickable on load
- the hamburger, mobile filter panel, gallery lightbox and language list each
  open, lock page scroll, release it on close, and return focus
- the custom listbox honours arrow keys, Home, End, type-ahead, Enter and Escape
- the price field groups thousands on screen while sending raw numbers to the query
- search and every filter return the correct listings, including an empty state
- language switching moves path, `html lang`, content and the stored preference
- every WhatsApp button carries the right listing title, listing code, page URL
  and its own button name
- consent actually gates the analytics request
- the server rejects an invalid enquiry even when the client checks are bypassed
- structured data parses and the sitemap covers every page in both languages
- the route transition closes, swaps content under cover, resets scroll and opens

---

## How it is built

Next.js 16 (App Router, React 19), Tailwind CSS v4, TypeScript, Motion-free CSS
transitions with Lenis for desktop smooth scrolling, Phosphor icons, Zod for
server-side validation.

### Layers

`globals.css` defines one z-index scale as tokens, and nothing in the codebase
uses a raw z-index:

```
content < sticky header < filter panel < mobile menu < lightbox
        < cookie banner < route curtain < skip link
```

There is deliberately no promo layer. The cookie bar sits above the mobile menu
in the token order but is never rendered while the menu, the filter panel or the
lightbox is open, and it publishes its own height so the floating enquiry button
on listing pages sits above it rather than under it.

### Components from Componentry

Two components were installed from <https://componentry.dev/docs> through the
shadcn registry and live in `src/components/vendor/`:

```bash
npx shadcn@latest add @componentry/text-animate @componentry/noise-texture
```

Both were **adapted**, and each file documents exactly what changed and why:

- **`text-animate`** drives every section headline through `SectionHeader`.
  Changes: the wrapper now carries `aria-label` and every segment is
  `aria-hidden`, because the original leaves split text readable and a
  per-character animation would otherwise be announced letter by letter;
  `motion.create()` moved out of the render body, where it was minting a new
  component type on every render and remounting the text; imports repointed at
  `motion/react`.
- **`noise-texture`** provides the grain in both loaders. Changes: the
  `transform: scale()` was removed. The original draws into a small buffer and
  then scales the canvas element up with `transformOrigin: top left`, painting
  well outside its own box and trusting an ancestor to clip it. The small
  buffer is now stretched to the element instead, which gives the same grain
  and cannot escape; `animate` defaults to off and is ignored under reduced
  motion; the window resize listener became a ResizeObserver.

**Rejected on purpose.** The rest of the catalogue leans on WebGL liquid,
dither, plasma, prism, matrix rain, ASCII and image-trail effects. Those read as
a nightclub flyer, not a property agency, and the brief here is a calm surface
where the listings are the loudest thing on the page.

Two were close and still dropped. `spotlight-card` would have suited the listing
grid, but it ships a purple cursor-tracking glow and imports from a workspace
alias that does not exist outside its own monorepo; a plain border that firms up
on hover says the same thing without the noise. `sticky-scroll-cards` is a good
component, but pinning full-screen cards on the way to a listing grid puts a
performance between the visitor and the property, which is the exact habit this
preview exists to remove. Neither was bent to fit.

### Motion

- Full page load: a brief intro loader that removes itself in CSS.
- In-app navigation: a slat curtain closes, the route changes behind it, the
  scroll resets while covered, then it opens. Navigating home shows the wordmark
  in the curtain.
- Every step of that sequence waits on `wait()` in `src/lib/wait.ts`, which
  **races a timer against the frame loop**. `requestAnimationFrame` alone stops
  when a tab is backgrounded, which would leave the curtain stuck shut forever.
- The link interception runs in the capture phase, because `next/link` calls
  `preventDefault()` in the bubble phase and a bubble listener would never see
  an unhandled click.
- Canvas grain in the loaders is sized to its own box and carries an explicit
  `clip-path`, so a scaled canvas cannot escape its container.
- Everything above `prefers-reduced-motion` collapses to static.

### Deployment notes

- `images.unoptimized` is set in `next.config.ts`. The Vercel image
  optimization quota on this account is exhausted, and with the optimizer on
  every image returns 402 and production renders blank. All artwork is SVG, so
  optimization buys nothing here anyway.
- Vercel Deployment Protection must stay **off** for this project, otherwise the
  preview URL asks visitors to log in.
