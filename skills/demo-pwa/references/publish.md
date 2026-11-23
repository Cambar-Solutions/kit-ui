# Publishing a demo link

Only when the user asks for a link. Publishing needs the user's account; never create accounts or log in for them. Ask which service they use if they have not said.

The build is a static site (`dist/`). It needs an SPA fallback so deep links like `/app/servicios/123` work.

## Cloudflare Pages (free, fast in Mexico)
```
npm i -D wrangler
npx wrangler login                 # user does this once, in their browser
npx wrangler pages deploy dist --project-name <slug>-demo
```
SPA fallback: Pages serves `index.html` for unknown paths when there is no `404.html`. Do not add one.

## Netlify
```
npm i -D netlify-cli
npx netlify login
npx netlify deploy --dir=dist --prod
```
SPA fallback: add `public/_redirects` with `/*  /index.html  200`.

## Vercel
```
npm i -D vercel
npx vercel login
npx vercel deploy --prod
```
SPA fallback: add `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.

## Headers worth setting
`/assets/*`: `Cache-Control: public, max-age=31536000, immutable`. `index.html`, `sw.js`, `manifest.webmanifest`: `Cache-Control: no-cache`. On Cloudflare and Netlify use `public/_headers`; on Vercel use `headers` in `vercel.json`.

## Before sending the link
- Open it on a phone (not only desktop) and run the demo script once.
- Use a non-guessable project name if the client's data or name should not be public, or protect it (Cloudflare Access, Netlify password, Vercel protection) if the user wants.
- The demo data lives in each visitor's browser; every person starts from the seed.
