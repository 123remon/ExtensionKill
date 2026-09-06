# Firefox Extension Kill Switch

A Firefox add-on that stops every other installed extension with one tap, then starts the previously enabled ones again.

## What it does

- **Stop** — disables all other extensions and remembers which ones were on
- **Start** — turns those saved extensions back on
- This add-on stays enabled so you can restore them
- The toolbar badge shows `OFF` while extensions are stopped

Built-in Firefox features are not affected. Only add-ons of type `extension` are toggled.

## Install in Firefox

1. Open Firefox
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select `extension/manifest.json` from this project
5. Click the toolbar icon and use **Stop** / **Start**

Temporary add-ons are removed when Firefox restarts. For a permanent install, pack the `extension` folder into an `.xpi` and install it, or use Firefox Developer Edition / Nightly with `xpinstall.signatures.required` set to `false`.

## Pack as XPI

```bash
cd extension
zip -r ../extension-kill-switch.xpi manifest.json background.js popup.html popup.css popup.js icons
```

Then open `about:addons` and install the `.xpi` file.

## Required permission

`management` — needed to list, disable, and enable other add-ons.

## Files

```
extension/
  manifest.json
  background.js
  popup.html
  popup.css
  popup.js
  icons/
    icon-48.png
    icon-96.png
```
