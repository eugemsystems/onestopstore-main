// /catalog/{slug} — serves an HTML file uploaded in the API admin (HTML Catalog Pages)
// as a standalone page.
//
// The URL is permanent; the file behind it is whatever was uploaded last for that slug.
// This is a route handler rather than a page on purpose: the uploaded file is a complete
// HTML document (its own <head>, styles and scripts), so it is returned as-is instead of
// being embedded inside the site layout.

const FILE_CACHE_SECONDS = 60 // a replaced file is live within about a minute

// The API serves the file at its ROOT (/catalog/{slug}), not under /api, so strip the /api suffix.
const apiRoot = () =>
    (process.env.NEXT_SERVER_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api')
        .replace(/\/+$/, '')
        .replace(/\/api$/, '')

// Where the visitor's browser reports the view (a public, browser-reachable URL under /api).
const hitBase = () =>
    (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_SERVER_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '')

// Click counting happens in the visitor's browser, not on a server: a small script is added to
// the page that reports the visit when a real browser actually loads and shows it. (The page's
// HTML is cached, so counting requests server-side would miss most views; and crawlers that
// only fetch the HTML never run the script.) The API stores the number and tells people and
// bots apart from the browser's own user-agent.
//
// sendBeacon with a text/plain body is a "simple" cross-origin request — it works from the
// sandboxed page (which has an opaque origin) without any CORS setup, and survives the visitor
// leaving right away. The visit is only reported once the tab is visible, so background
// prefetches/pre-renders don't count.
const beaconSnippet = (hitUrl) =>
    '<script>(function(){try{var u=' + JSON.stringify(hitUrl) + ',done=false;' +
    'function send(){if(done)return;done=true;try{' +
    'if(navigator.sendBeacon){navigator.sendBeacon(u,new Blob(["1"],{type:"text/plain"}))}' +
    'else{fetch(u,{method:"POST",mode:"no-cors",keepalive:true,body:"1"})}' +
    '}catch(e){}}' +
    'if(document.visibilityState==="hidden"){document.addEventListener("visibilitychange",function(){' +
    'if(document.visibilityState==="visible")send()})}else{send()}' +
    '}catch(e){}})();</script>'

// Put the snippet just before the last </body> (or at the end if the file has none).
function withBeacon(html, hitUrl) {
    const snippet = beaconSnippet(hitUrl)
    const closers = [...html.matchAll(/<\/body\s*>/gi)]
    if (closers.length === 0) return html + snippet
    const at = closers[closers.length - 1].index
    return html.slice(0, at) + snippet + html.slice(at)
}

const unavailable = () =>
    new Response('Temporarily unavailable. Please try again shortly.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '30', 'Cache-Control': 'no-store' },
    })

const notFoundPage = () =>
    new Response(
        '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex">' +
        '<title>Page not found</title></head><body style="font-family:sans-serif;text-align:center;padding:4rem">' +
        '<h1>Page not found</h1><p><a href="/">Back to One Stop Store</a></p></body></html>',
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=30' } }
    )

export async function GET(_request, { params }) {
    const { slug } = await params

    // Same character set the admin allows; anything else can't exist.
    if (!/^[a-z0-9_-]+$/i.test(slug || '')) return notFoundPage()

    const name = encodeURIComponent(slug.toLowerCase())

    let res
    try {
        res = await fetch(`${apiRoot()}/catalog/${name}`, {
            next: { revalidate: FILE_CACHE_SECONDS },
            headers: { Accept: 'text/html' },
            signal: AbortSignal.timeout(10000),
        })
    } catch {
        return unavailable()
    }

    if (res.status === 404) return notFoundPage()
    if (!res.ok) return unavailable()

    const html = withBeacon(await res.text(), `${hitBase()}/catalog/${name}/hit`)

    return new Response(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            // Browsers/CDN may keep it briefly; then it is re-fetched, so a replaced file shows up.
            'Cache-Control': `public, max-age=0, s-maxage=${FILE_CACHE_SECONDS}, stale-while-revalidate=300`,
            'X-Content-Type-Options': 'nosniff',
            // The uploaded HTML is arbitrary. Sandboxing (no allow-same-origin) lets its own
            // scripts, styles and forms run, but keeps it away from this site's cookies,
            // storage and logged-in session.
            'Content-Security-Policy': 'sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads',
        },
    })
}
