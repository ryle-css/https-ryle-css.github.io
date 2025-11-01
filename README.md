# Happy Birthday — Surprise Site

This is a single-page colorful birthday surprise ready to upload to GitHub Pages.

Files included:
- `index.html` — the site markup.
- `style.css` — styles, animations, and responsive layout.
- `main.js` — reveal logic and confetti animation.

Preview locally:
1. Open `index.html` in your browser (double-click or use "Open File").
2. Click the "Surprise Me 🎂" button.

Welcome modal:
- When the page loads, a welcome modal will appear with an optional name input.
- Type a name (or leave blank) and press "Open Message" to update the heading and reveal the cake, balloons, and confetti.

Letter experience:
- Clicking "Surprise Me 🎂" opens a virtual letter (envelope) with a birthday message.
- Inside the letter press "Open Cake 🎂" to play the melody, show animated floating messages, and reveal the cake with confetti.
- Use the "Close" button in the letter to dismiss it without revealing the cake.

New features added:
- Signature font: the letter signature uses the Google font "Great Vibes" for a handwritten look.
- Mute/unmute: a small toggle (🔊 / 🔈) appears next to the Surprise button to disable/enable audio; preference is saved in localStorage.
- Printable/downloadable card: inside the letter you can Print the card (opens print dialog) or Download the card as a PNG image (generated client-side).
- Candle flicker: when the cake is revealed the candle tops get a subtle flicker animation.
 - Note: Print and Download options were removed per request. The letter is now editable directly.
 - Editing the letter: open the letter and click Edit to change the message; Save will persist it for the current session.

Upload to GitHub (quick commands for PowerShell):
```powershell
# initialize git repo (only if you haven't already)
git init
git add .
git commit -m "Add happy-birthday site"
# create a repo on GitHub and replace the URL below with your repo URL
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

To publish with GitHub Pages, go to your repository Settings → Pages and select the `main` branch and `/ (root)` folder.

If you want me to create a `index.html` that works with a specific username/repo for automatic GH Pages, tell me the repo name and I can add more instructions.
