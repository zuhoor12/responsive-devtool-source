# Responsive DevTool

Responsive DevTool shows a website on many devices side by side, using the **real page**, so you can see how it looks and behaves on each screen before you publish it. It runs as a browser extension for **Chrome** and **Firefox**.

> ابزاری برای دیدن یک وب‌سایت روی ۵۸ دستگاه (گوشی، تبلت، لپ‌تاپ و مانیتور) به‌صورت هم‌زمان، با صفحه‌ی واقعی و نوار مرورگر واقعی. با بازرس، ممیزی دسترسی‌پذیری، لاگ شبکه، Color Picker و اسکرین‌شات.

![Multi view](docs/screenshots/1-multi-view.png)

## Features

**Devices**
- 58 phones, tablets, laptops and desktop screens, from iPhone SE to 4K monitors.
- Single view for one device, or Multi view to compare several devices in one window.
- Rotate devices, set any width and height, and add your own custom device.
- Each device shows the page with the browser UI around it: Safari on iPhone and iPad, Chrome on Android, Chrome on Windows and on macOS.
- Scroll each device on its own, or sync scrolling across devices.

**Inspector**
- DOM tree: click an element to select it, or hover to highlight it on the page.
- Computed CSS, box model, element size, colour and font.
- Breakpoint ruler and an overflow check (elements wider than the screen).
- Accessibility audit: colour contrast, headings, image alt text, keyboard order, focus, button and link names, form labels.
- Network log of requests for each device, with status, size and time.

**Colour picker**
- Hover an element to see its colour: the text colour for text, the background colour otherwise.
- Click to pick it. Copy as HEX or RGB; HSL and OKLCH are shown too.
- Lists the colours used on the page.

**Other**
- Screenshots of a device, or of all devices at once, and copying to the clipboard.
- A QR code to open the same page on a real phone.
- Keyboard shortcuts (`Ctrl+K` opens the command palette).

## Browser support

| Feature | Chrome / Edge | Firefox |
|---|:---:|:---:|
| Device preview, Multi view, browser UI | ✅ | ✅ |
| Inspector, accessibility audit, colour picker | ✅ | ✅ |
| Network log | ✅ | ✅ |
| Viewport screenshots | ✅ | ✅ |
| Network throttling (Slow 3G, Fast 3G, 4G, Offline, custom) | ✅ | ❌ |
| Full-page screenshots, 2x / 3x screenshots | ✅ | ❌ |
| Touch, dark mode and reduced-motion emulation | ✅ | ❌ |

The features marked ❌ use the DevTools protocol (`chrome.debugger`), which Firefox does not provide to extensions.

## Install

### From a release
Download the zip from the [GitHub Releases](https://github.com/zuhoor12) page and install it:
- **Chrome / Edge:** open `chrome://extensions`, turn on *Developer mode*, choose *Load unpacked* and pick the unpacked folder. (Or unzip the release and load that folder.)
- **Firefox:** open `about:debugging#/runtime/this-firefox` and choose *Load Temporary Add-on*, then pick `manifest.json` from the unpacked folder.

### From source
Requires Node.js 20 or newer.

```bash
npm ci
npm run build           # Chrome and Firefox  -> dist/chrome and dist/firefox
npm run build:chrome    # only Chrome
npm run build:firefox   # only Firefox
npm run package         # builds both and creates the zips in releases/
```

To rebuild while you edit: `npm run watch:chrome` or `npm run watch:firefox`.

## Test your website on a real phone

Your phone cannot open `localhost` on your computer. So the development server of **your website** must listen on your network, and the tool must use your computer's network address.

1. In the project of **your website** (not this repository), start the dev server so that it listens on the network:

   ```bash
   npm run dev -- --host
   ```

   This works with Vite projects. For other frameworks the flag differs, for example `HOST=0.0.0.0 npm start` (Create React App) or `next dev -H 0.0.0.0` (Next.js).

2. In the terminal, find the **Network** address of your computer. It is printed by the dev server, for example `http://192.168.1.25:5173/`. Keep the part after `http://`, which is `192.168.1.25:5173`.

3. Open Responsive DevTool, load `http://localhost:5173/` and click the phone icon at the top (or *Test on a real phone* in `Ctrl+K`).

4. In the box that appears, enter the network address from step 2. The QR code changes to that address.

5. Connect your phone to the **same Wi-Fi** as your computer, and scan the QR code with the phone's camera.

If the page does not open on the phone, check that your firewall allows the port (for example 5173), and that the phone is not on a guest network or a VPN.

## How it works

The tool has three parts, all in this repository:

| Folder | What it does |
|---|---|
| `src/app/` | The viewer page (React + Tailwind CSS, built with Vite): device frames, panels, dialogs. |
| `src/content/` | The page agent. It is injected into each device frame and handles the inspector, colour sampling and the accessibility audit. |
| `src/background/` | The background script. It allows the viewer to frame websites (it removes `X-Frame-Options` and CSP framing headers for the viewer's own tab only), logs network requests, and attaches the debugger for the Chrome-only features. |
| `src/core/` | The messaging layer between the viewer and the page agent (the `rdt` API). |
| `manifests/` | `manifest.chrome.json` and `manifest.firefox.json`. |
| `public/` | Device frame images and icons. |

Device data is in `src/app/lib/devices.js`. To add a device, add an entry there and, if it needs a frame, add an image in `public/mockups/`.

## Permissions

- `<all_urls>` and `scripting`: show and inspect any site the user chooses to preview.
- `webRequest` and `declarativeNetRequest`: log requests, and remove framing headers for the viewer tab only.
- `storage`: save settings on the user's computer.
- `clipboardWrite`: copy screenshots and colours.
- `debugger` (Chrome only): throttling, touch and full-page screenshots.

## Privacy

Responsive DevTool does not collect or send any data to a server. Settings are stored on your computer only. Pages are loaded by your browser, just as in any other tab.

## Limitations

- The address bar in the device frames is for display only. Use the address field at the top of the tool to change the page.
- Some sites detect that they are inside a frame and behave differently. The tool removes the framing headers, but it cannot stop a site's own scripts from breaking out of a frame.
- Testing on a real phone needs the phone and the computer on the same network. See [Test your website on a real phone](#test-your-website-on-a-real-phone).

## Contributing

Issues and pull requests are welcome. Before you open a pull request, please run `npm run build` and check that both builds finish without errors.

## Credits

Third-party libraries and their licences are listed in [CREDITS.md](CREDITS.md). The project changelog and progress notes are in [PROGRESS.md](PROGRESS.md).

## License

MIT. See [LICENSE](LICENSE).

## Author

Made by [zuhoor12](https://github.com/zuhoor12).