# Notes for AMO reviewers: how to build this add-on from source

Node.js 20 or newer and npm 10 or newer.

    npm ci
    npm run build:firefox      # output: dist/firefox  (the add-on that is submitted)

Source files:
- src/core/        messaging API between the viewer page and the page agent
- src/background/  background script (header handling for the viewer page, network log)
- src/content/     page agent injected into the device frames (inspector, colour sampling)
- src/app/         the viewer UI (React + Tailwind), built with Vite into the viewer page
- manifests/       manifest.firefox.json is used for the Firefox build

The minified files in dist/ are generated from the sources above by `npm run build:firefox`.
Third-party libraries are listed in package.json; their licences are in CREDITS.md.

Data handling: the add-on does not send any data to a server. Settings are stored with
storage.local on the user's computer.
