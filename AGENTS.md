<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Local checks

`next build` and `next start` both own `.next`. Running a build while the
production server is still serving fails with a spray of unrelated
Turbopack errors that look like real compile failures but are not. Stop
the server first:

```bash
PID=$(ps -eo pid,args | grep next-server | grep -v grep | awk '{print $1}')
[ -n "$PID" ] && kill "$PID"
```

Do not `pkill -f "next start"` — the pattern matches the shell running it
and kills your own session.

# Marketing site rebuild

Read `HANDOVER.md` first - it covers the state of the rebuild, the
decisions behind it, what is still open and the traps in this
environment.

The public pages are being rebuilt from the original Webflow site. See
`reference/webflow/DESIGN.md` for the palette and treatment, and
`reference/webflow/README.md` for what was extracted and what is still
missing. Copy lives in `lib/content/`, components in `components/site/`,
and the work in progress is served from `/preview` so the current
marketing pages stay up.
