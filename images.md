# Project Image Inventory

Generated on 2025-10-15. Updated after replacing gallery, about, and menu hero images with assets from `public/images/new images/`.

## Summary
- Base directory: `public/images`
- Top-level legacy hashed PNGs (previously referenced): 34 PNG + 1 SVG + 1 PNG (`aboutus.png`)
- Subdirectory `new images`: 84 numbered PNG files (1.png - 84.png)
- Subdirectory `uploads`: (dynamic runtime uploads; currently only `README.md` committed)
- ACTIVE references now use ONLY numbered images from `new images/` for:
	- Gallery grid: `1.png` – `30.png`
	- Gallery video thumbnails: `31.png`, `32.png`
	- Gallery hero background: `33.png`
	- About Us hero background: `34.png`
	- Menu hero background: `35.png`
	 - Index (home) hero background: `36.png`
	 - Index highlight section inline image: `37.png`
	 - Contact hero background: `38.png`
	 - Reservation hero background: `39.png`
	 - Site logo: `logo.png`
	 - Favicons: `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`
- Placeholder SVG (`placeholder-food.svg`) still used for menu item fallback.
- Legacy hashed images and `aboutus.png` are now UNUSED (candidates for removal or archival).

## Detailed Listing & References

### Legacy Top-Level Images (now unused)
All previously referenced hashed images and `aboutus.png` are now unused after migration to numbered assets. Consider removing or archiving:
`0aee548a...`, `143afebf...`, `197bc384...`, `1cf9179c...`, `1f161bac...`, `2113dcf7...`, `2777b9fc...`, `28117363...`, `2850dedc...`, `2a6f48a5...`, `3f403e4e...`, `480dd221...`, `4a99af30...`, `545c2758...`, `57650b82...`, `5b6092e6...`, `68a6e030...`, `6e68544b...`, `7b32962f...`, `7c8ae1ad...`, `8074fb11...`, `8385f424...`, `97a3f1c0...`, `9b01b889...`, `9e0460ad...`, `aboutus.png`, `b9d15489...`, `bbf2a0c0...`, `d4f3c81a...`, `e26eb677...`, `e90c077c...`, `f0aa01a4...`, `fbb684c2...`, `fec6a3c9...`
`placeholder-food.svg` remains active for menu placeholders.

### `new images/` Subdirectory
Active references:
- Gallery grid: `1.png` – `30.png`
- Video thumbnails: `31.png`, `32.png`
- Gallery hero: `33.png`
- About hero: `34.png`
- Menu hero: `35.png`
- Index hero: `36.png`
- Index highlight image: `37.png`
- Contact hero: `38.png`
- Reservation hero: `39.png`
Unused (currently): `40.png` – `84.png`

### `uploads/` Subdirectory
- Currently only `README.md` tracked. Runtime uploads will appear here and are served statically via Express: `app.use('/images/uploads', express.static(uploadsDir));` in `server/index.js`.
- Deletion logic exists: when deleting menu items with an `/images/uploads/` reference, the corresponding file is removed.

## Recommendations
1. Remove legacy hashed images (after confirming no runtime references) to reduce repo size.
2. Generate WebP/AVIF versions for `1.png` – `35.png` and use `<picture>` for progressive enhancement.
3. Consider renaming numbered files to semantic names if their subjects are stable (scripted rename + codemod).
4. Add an asset manifest JSON to describe alt text & categories explicitly instead of inline arrays.
5. Implement a script to flag unused numbered images (`36.png+`) to keep directory clean.
6. Long term: move gallery assets to a CDN or object storage for cache control and faster global delivery.
 7. Produce optimized favicon set (`favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`) and ensure `logo.png` is compressed (target <30KB if possible).

## Scan Methodology
- Enumerated directory contents in `public/images` and subdirectories.
- Searched codebase for exact filename strings and directory patterns.
- Updated code to replace hashed image references with numbered images.
- Did not inspect binary contents or EXIF data.
- Timestamp: 2025-10-15 (post-migration).

---
Generated automatically. Regenerate after significant asset changes.
