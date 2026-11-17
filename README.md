# Linux → SOC Analyst L1 → L2 Roadmap

A static, Arabic RTL, responsive learning roadmap. No framework, build step, database, or backend is required.

## Files
- `index.html` — page structure
- `styles.css` — responsive navy/blue design
- `curriculum.js` — editable curriculum: phases, lesson titles, instructors, course lesson numbers, durations, links, and practical labs
- `app.js` — rendering, search/filter, checkboxes, localStorage progress, JSON export/import
- `vercel.json` — simple static deployment configuration

## Run locally
Open `index.html` in a modern browser. For best results, use a small local static server, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub and Vercel
1. Create a GitHub repository.
2. Upload all files in this folder to the repository root.
3. In Vercel, choose **Add New → Project**, import that GitHub repository, and deploy.
4. Framework Preset: **Other**. Build Command: leave empty. Output Directory: `.` (repository root).

No environment variables are required.

## Progress tracking
Progress is stored in this browser's `localStorage`. The main completion percentage counts required lessons only; optional review lessons do not block completion. Use **Export progress** to save a JSON backup. Use **Import progress** after changing browsers or devices. Progress is not synced between devices automatically because this is a static app without a user database.

## Curriculum accuracy notes
- The Tanany Academy playlist is represented by its 72 numbered lessons. A third-party course index showed an additional private/unavailable playlist slot; that hidden item is intentionally excluded. Playlist links account for that slot after lesson 001.
- Tanany lesson titles and durations are based on the indexed course listing. If YouTube changes playlist order, verify the linked lesson before relying on the index.
- Abdullah Al-Nuaimy's 28-video playlist is partly selected. Runtime is shown only where it was visible in the supplied playlist information; otherwise the card says the duration is unverified rather than inventing one.
- For some later SOC videos, exact video duration was not confirmed. Their cards distinguish a suggested study time from an actual video runtime.
- The roadmap is deliberately interleaved by prerequisite order: a supporting lesson from another instructor appears immediately after the concept it reinforces, rather than grouping all videos by channel.
- Optional/repeated material is not counted as required completion; it remains searchable in the main curriculum and in the optional resources section.

## Editing the curriculum
Edit the `CURRICULUM`, `PHASES`, and `OPTIONAL_RESOURCES` arrays in `curriculum.js`. Each lesson should have a stable `id`, `phase`, `course`, `instructor`, `sourceNo`, `title`, `duration`, `url`, and a `required` flag.
