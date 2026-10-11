# PUPCAST

PUPCAST is a responsive, static weather-and-outfit prototype. Search for a US city or ZIP code, or choose **Use my location**, then select one of seven forecast days to see a Bichon outfit, weather summary, reminders, and notable forecast changes. The [live site](https://chelseajylee13.github.io/Project-3-Demo/) is hosted on GitHub Pages.

## Run locally

Use Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To verify a production build:

```sh
npm test
npm run build
npm run preview
```

`npm run preview` prints a separate local URL. The Vite base is repository-relative (`./`), so the same build works under the GitHub Pages project subpath.

## Deployment and data

A push to `main` runs [the Pages workflow](.github/workflows/deploy-pages.yml): install dependencies, run tests, build `dist/`, and publish the build through GitHub Actions. Repository Settings → Pages must use **GitHub Actions** as the source. `dist/` is generated and is not committed.

The browser requests US geocoding and weather from [Open-Meteo](https://open-meteo.com/). No API secret or server is required. This is a noncommercial prototype using Open-Meteo's free API; review its [terms](https://open-meteo.com/en/terms) and arrange an appropriate license/service plan before any commercial or promotional launch. Forecasts and outfit suggestions are general comfort guidance, not safety or medical advice.

PUPCAST stores one recent location label and coordinates in the browser; choosing a new location replaces it. It has no accounts, analytics, ads, or application cookies. The About page explains data handling, provider logging, and credits. The production [asset manifest](src/assets/asset-manifest.json), [specification](spec.md), and [Nunito font license](public/licenses/Nunito-OFL.txt) record the artwork and font sources. Design references in `reference/` and unreviewed process files do not ship.
