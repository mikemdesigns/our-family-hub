# Adding photos to family events

Each event has its own folder inside `public/images/events`. Pictures placed there become ordinary static website files when the site is built and deployed.

## Example: Sophia's birthday party

1. Copy the selected pictures into:

   `public/images/events/sophia-birthday-party/`

2. Give them short web-friendly names using lowercase letters, numbers, and hyphens, for example:

   - `sophia-cake.jpg`
   - `sophia-family.webp`
   - `sophia-decorations.jpg`

3. Open `src/content/initiatives/sophia-birthday-party.md` and update its `photos` section:

```yaml
photos:
  coverImage: '/images/events/sophia-birthday-party/sophia-cake.jpg'
  gallery:
    - src: '/images/events/sophia-birthday-party/sophia-family.webp'
      alt: 'Sophia smiling with family at her birthday party'
    - src: '/images/events/sophia-birthday-party/sophia-decorations.jpg'
      alt: 'Birthday decorations at Sophia’s party'
  albumUrl: ''
```

The cover photo is the large image. Gallery pictures appear as smaller images underneath it. Every gallery photo needs a short `alt` description explaining what is visible for relatives who use screen readers.

If you have a deliberately shared Google Photos album, put its HTTPS share link in `albumUrl`. Leave it empty when you want only the photos stored on the website.

## Other event folders

- `public/images/events/rashid-birthday/`
- `public/images/events/kamaal-birthday/`
- `public/images/events/sophia-pointe-shoes/`
- `public/images/events/rashid-graduation-fees/`

Use the same `photos` structure in that event's Markdown file. You can add more event folders later; the folder name should match the event filename for easy maintenance.

## Preparing images

- Use JPG, PNG, WebP, or AVIF files.
- WebP is a good default for smaller downloads.
- Resize very large phone photos before committing them. Around 1600 pixels on the longest side is enough for this layout.
- Avoid putting private location, school, travel, or identifying information in filenames or photo metadata.
- Only publish photos approved for the relatives who can access the website.

Preview the result with `npm run dev`. When it looks right, commit the new images and Markdown update, then deploy normally.
