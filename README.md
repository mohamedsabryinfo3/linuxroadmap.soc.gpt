# Linux → SOC Analyst L1 → L2 Roadmap

Arabic, RTL, responsive static learning roadmap. The visual layout follows the provided `network-ccna-to-soc.vercel.app` reference: centered page, light background, progress ring, next-lesson callout, sticky pill tabs, filters, phase progress bars, and a vertical lesson timeline. Each lesson adds instructor, course name, playlist lesson number, video/runtime estimate, and a direct source link.

## Preview
- `previews/preview-desktop.png` — desktop screenshot
- `previews/preview-mobile.png` — mobile screenshot

## Files
- `index.html` — page structure and tabs
- `css/style.css` — reference-inspired responsive styling
- `curriculum.js` — ordered curriculum, phase labels, instructors, course/video numbers, runtimes, source links, and optional resources
- `app.js` — filtering, progress tracking, next lesson, source library, export/import
- `vercel.json` — static deployment settings

## Run locally
Open `index.html` in a modern browser, or use a local server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub + Vercel
1. Create a GitHub repository.
2. Upload the **contents of this folder** to the repository root (not the containing folder as a nested directory).
3. In Vercel, choose **Add New → Project**, import that GitHub repository, then deploy.
4. Set Framework Preset to **Other**.
5. Leave Build Command and Install Command empty.
6. Set Output Directory to `.` (repository root).
7. No environment variables are needed.

## Progress tracking
- Completion is stored in the current browser's `localStorage`.
- The main progress percentage counts required lessons only; support and optional material do not block completion.
- Use **تصدير التقدم** to export a JSON backup and **استيراد التقدم** on another device/browser. Progress is not automatically synchronized between devices because this is a static site without a backend.

## Curriculum notes
- The learning order is interleaved by prerequisite: a useful supporting lesson from another instructor appears directly after the concept it reinforces.
- The Tanany Academy Linux Administration playlist is the core Linux administration source. Selected lessons from Abdullah Al-Nuaimy, Security Jordan, and the Arabic ethical-hacking course are inserted where they add new skills instead of repeating the whole course.
- Some lesson durations were not visible in the source listings. Those cards explicitly show a suggested study time or that the video duration is unverified; suggested study time is not presented as actual video runtime.
- The separate source library explains which course segments are core, supporting, optional, or reference-only.

## Edit the curriculum
Edit `CURRICULUM`, `PHASES`, and `OPTIONAL_RESOURCES` in `curriculum.js`. Keep each lesson's `id` stable so saved progress remains associated with the correct lesson.
