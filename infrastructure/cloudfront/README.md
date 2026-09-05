# inosta.cc routing

Distribution: `E233ZB7X9T7Y0Q` (`d2h5i8llgsg6ic.cloudfront.net`).

The default origin is `hugo-blog-john-1645648154317`, with no origin
path, and the default root object is `index.html`.
The LIVE CloudFront Function `inosta-hugo-root` runs on viewer requests
for the default behavior. Its source is `hugo-root.js`.
It redirects `/blogs` and `/blogs/*` permanently to the root, retaining
query parameters, and rewrites directory requests internally to `index.html`.

Ordered exceptions:

| Path | Origin | Viewer-request handling |
| --- | --- | --- |
| `/images/out-2.webp` | `nostr-image-services-prod` | None |
| `/.well-known/*` | `nostr-image-services-prod` | None |
| `/player/*.mp3` | `bucket-music-app-489784165a864` | None |
| `/player/*` | `bucket-music-app-489784165a864` | Existing `redirectHtml:3` Lambda |

Other former Nostr paths now resolve against the Hugo bucket.
The old `/blogs/*`, `/images/*` and `/*` behaviors were removed.
The two unused origins were removed from the distribution; no buckets
or S3 objects were deleted.

Hugo and GitHub Actions now target the bucket root. The workflow deliberately
omits `--delete` to retain legacy objects and uses revalidation for uploaded
content. CloudFront invalidation covers `/*`.
Changes to the function source need a separate CloudFront function update
and publication; the Hugo workflow only publishes site content.

Migration verified on 2026-09-05: distribution Deployed, invalidation Completed,
homepage, posts, newsletters, profile image and LNURL endpoint returned 200;
legacy blog URLs returned 301 with query strings preserved.
Temporary pre-migration backups on the migration machine:
`/tmp/inosta-cloudfront-before.json` and `/tmp/inosta-hugo-before/`.
These temporary files are not durable backups.
