# The Martin Family

A mobile-first Astro family hub. Event content lives in `src/content/initiatives/*.md`, validated by the Astro collection schema. No database, payment processing, or photo-library access.

## Updating family moments

Edit the matching Markdown frontmatter. `raised: null` means unconfirmed, never zero. Set an actual amount (including zero if confirmed) to display the progress bar and remaining amount. Dates use quoted YYYY-MM-DD strings; `date: null` means a date has not been chosen. Event date and fundingDeadline are separate fields.

Status is derived using the America/New_York calendar date and refreshed on load, once a minute, and when the tab becomes visible. Dated completed events move into memories. No-date events stay active. Use status `auto` by default; overrides are `funding`, `funded`, `upcoming`, `completed`, and `made-possible`. With JavaScript disabled, the build-time state appears until the next build.

Rashid's event contains only surprise-safe wording. Do not add private surprise details to the source unless you intend them to be delivered to visitors; hidden client content is not private.

## Payment methods

Global methods are in `src/lib/events.mjs`. Each initiative's `paymentMethods` can override individual method fields. Disabled or empty destinations are not rendered. External links must use HTTPS. Zelle copies its explicitly configured destination.

Example frontmatter:

```yaml
paymentMethods:
  cashapp:
    enabled: true
    url: 'https://cash.app/YOUR_REAL_DESTINATION'
  venmo:
    enabled: false
    url: ''
  zelle:
    enabled: false
    destination: ''
  card:
    enabled: false
    url: ''
```

Use an actual provider payment link for card/wallet options; wallet availability depends on the provider. No payment is confirmed by the site, and totals only change when edited by the family.

## Photos

Add only deliberately shared album URLs to a specific event. No Google Photos API is used. Set `photos.albumUrl` to the shared link and `photos.coverImage` to an HTTPS image URL or `/images/filename.jpg` placed in public/images. Never put private-library links into a shared site. Completed events without albums say photos are to come.

## Build and maintenance

Run `npm install`, `npm run dev`, `npm test`, and `npm run build`. Static output is `build/`. Publish an updated build after content changes. The included GitHub Actions workflow builds on a runner and uploads the static output to DreamHost. See DEPLOYMENT.md for setup.

The page has noindex/nofollow and robots.txt disallow rules. These are not authentication. The DreamHost domain will be publicly reachable once you upload it unless you separately enable access protection. The requested family subdomain requires domain configuration and has not been connected.

## Content still needed

Confirmed funding totals, Kamaal's payment destination, Sophia's milestone date (optional), and explicitly shared memory photos/albums. Rashid and Sophia have their supplied Cash App pool links enabled. Only the three initial initiatives are included; example school events and completed memories were not treated as real family data.
