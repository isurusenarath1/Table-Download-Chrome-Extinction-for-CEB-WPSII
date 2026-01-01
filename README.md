# Export Table to Excel

A small browser extension (Manifest V3) that exports HTML tables from the active page to `.xls` or `.csv` files.

**Project summary**

- **Name:** Export Table to Excel
- **Manifest:** `manifest_version: 3`
- **Version:** `2.0`
- **Description:** Export any table on the current webpage to an Excel or CSV file.
- **Permissions:** `scripting`, `activeTab`

**File overview**

- `manifest.json` — extension manifest (MV3). Contains extension metadata, permissions, and points `action.default_popup` to `popup.html`.
- `popup.html` — popup UI shown when clicking the extension icon. Includes inputs for filename and format and a status area.
- `popup.css` — styles for the popup UI (modern, accessible look + loading spinner).
- `popup.js` — popup logic:
  - Reads filename and format from the popup.
  - Queries the active tab (`chrome.tabs.query`) to get the `tabId`.
  - Uses `chrome.scripting.executeScript` to inject `exportTable` into the active page, passing `filename` and `format` as arguments.
  - Shows friendly status and loading state in the popup.
  - The injected `exportTable` function searches for the first `<table>` on the page and does one of:
    - `csv`: serializes table rows and cells to CSV (double-quotes escaped) and initiates a `Blob` download.
    - `xls` (default): serializes the table's outerHTML into a `data:` URL with `application/vnd.ms-excel` and downloads it.
- `content.js` — (present but empty) reserved for content script logic if you want an always-on script rather than injecting on demand.
- `logo2.png` — referenced in `manifest.json` as `action.default_icon` (if present in the folder it will be used as the toolbar icon).

**How to install (developer / local load)**

1. Open your browser's extensions page:
   - Edge: `edge://extensions/`
   - Chrome: `chrome://extensions/`
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the extension folder:

```
E:\GitHub\Before Done\Table Download Extinction fir CEB
```

4. The extension should appear in the toolbar. Click it to open the popup.

**How to use**

- Open a web page that contains an HTML `<table>` you want to export.
- Click the extension icon (or open the popup) — a small dialog with a filename input, format selector (`.xls` or `.csv`), and an Export button will appear.
- Enter a filename (the extension will add the appropriate file extension if omitted).
- Choose `.xls` to download a simple HTML-based Excel file, or `.csv` to download a proper CSV file with quoted cells.
- Click Export and check your browser downloads (the popup shows short status messages).

**Notes on behavior & limitations**

- The popup injects the exporter on demand using `chrome.scripting.executeScript`. That requires the `activeTab` permission and the current tab to be active and focused.
- If you need the exporter to run without user interaction (e.g. context menu or background trigger), consider adding `host_permissions` or a content script to the manifest.
- CSV export is simple: it iterates table rows and cells and wraps cell text in double-quotes, escaping inner quotes by doubling them. It does not attempt to detect numbers, dates, or locale-specific separators.
- Excel export uses `application/vnd.ms-excel` + HTML table wrap. This is a quick compatibility hack that works for many spreadsheet apps but is not an official XLSX file.
- Content scripts injected into pages can be blocked by strict CSPs; `chrome.scripting.executeScript` respects page CSP in some browsers.

**Manifest / MV3 notes**

- This repo was migrated to Manifest V3. `manifest_version` is `3` in `manifest.json`.
- Permissions used:
  - `scripting` — to inject the `exportTable` function into the page.
  - `activeTab` — to allow temporary access to the active tab when the user triggers the popup.
- If you need permanent host access (for programmatic operations without user click), add `"host_permissions": ["<all_urls>"]` or a more limited list of patterns.

Example `manifest.json` snippet to add host permissions:

```json
"host_permissions": [
  "<all_urls>"
]
```

**Developer notes / recommended improvements**

- Add a content script (update `manifest.json`) if you want export behavior available without injection from the popup. Example snippet:

```json
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }
]
```

- Add a `background.service_worker` if you need background tasks (manifest V3).
- Add properly sized icons and declare them in `manifest.json` (`icons` and `action.default_icon`) for a polished toolbar presence.
- Replace the simple HTML->XLS approach with a proper XLSX library (e.g. `SheetJS`) for robust Excel exports (this will increase bundle size and may require bundling).
- Improve CSV export to support column selection, encoding options (UTF-8 BOM), and delimiter config.

**Troubleshooting**

- "Required value 'version' is missing or invalid" — make sure `version` in `manifest.json` is a string like `"2.0"` (already fixed in this repo).
- "Cannot install extension because it uses an unsupported manifest version" — ensure `manifest_version` is `3` for current Chromium-based browsers.
- If injection fails with `chrome.scripting.executeScript` errors, confirm the tab is active and that the origin is supported. Check the developer console for the extension (on the extensions page enable "Inspect views" for the popup) to see error logs.

**Security & privacy**

- The extension only acts on the active tab when the user clicks the popup (due to `activeTab`). It does not automatically access or send data off-device.
- If you add `host_permissions` or upload to a store, review the permissions and provide a privacy policy if required.

**Contact / Attribution**

- Developed By: Isuru Senarath - Intern WPS II - IT (credit shown in `popup.html`)

**Next steps I can do for you**

- Add `host_permissions` and a content script for always-on capability.
- Add a background `service_worker` to support context menu or keyboard shortcuts.
- Integrate `SheetJS` to produce `.xlsx` files.
- Add icons and package the extension for distribution.

---

If you want, I can now:
- Add `host_permissions` and a small `content.js` implementation (so the Export button can work without injection), or
- Add icons and a `background.service_worker` and configure a context-menu export.

Tell me which next step you'd like and I'll implement it.
