# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved research, project brief, and hand-drawn screen designs into testable requirements.

## Instructions for the Developer

Make and approve the product decisions, draw every proposed screen, provide the drawings to the Agent, and keep this file current as the intended result changes.

To begin, open the project repository in a fresh chat and enter:

`Read ./spec.md and help me begin the Project 3 specification.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, and this file. Review the screen drawings the Developer provides. Ask one focused question at a time, surface gaps and trade-offs without inventing requirements, and keep the specification concise and testable.

## Goal

PUPCAST helps US college students choose practical attire for a campus day using current and forecast weather. It addresses this approved user story:

> As a college student preparing for a day on campus, I want an outfit recommendation based on the day's changing weather, so that I can stay comfortable and remember protective items such as an umbrella, sunscreen, and water-resistant shoes.

The upright Bichon Frise mascot models the same gender-inclusive campus outfit recommended to the User; PUPCAST does not recommend clothing for a dog.

## Screen designs

The final hand-drawn references are:

- [Phone main recommendation screen](reference/34-main-phone-final.png)
- [Laptop main recommendation screen](reference/35-main-laptop-final.png)
- [Phone information screen](reference/36-info-phone-final.png)
- [Phone location search](reference/37-search-phone-final.png)
- [Laptop information screen](reference/38-info-laptop-final.png)
- [Laptop location search](reference/39-search-laptop-final.png)
- [Phone states and interactions](reference/40-states-phone-final.png)
- [Laptop states and interactions](reference/41-states-laptop-final.png)

The drawings define the visual direction, hierarchy, and responsive composition. The requirements below control where an example in a drawing conflicts with an approved behavior. In particular:

- The phone main screen includes the same seven-day selector shown on laptop. It uses a selected-location button plus sticky location and date shortcuts; device location is requested only from the search dialog.
- Phone navigation uses a header information control and an information-screen Back control, not persistent Home/About bottom navigation.
- The reminder section contains only umbrella, water-resistant shoes, sunscreen, and water cards. Sunglasses may appear on the mascot but are not a fifth reminder card.
- High UV activates the sunscreen reminder and, when high UV is the primary visual condition, a sun-protection outfit. It does not trigger the Forecast Change callout, which uses only the temperature, rain, and snow rules defined below.
- The most recent location label and coordinates are stored in the browser as described under Privacy, despite contradictory placeholder copy in one drawing.

## Requirements

### R1. First use and location selection

On first use, PUPCAST shows a location-selection state rather than default weather. The User can search for a US city or ZIP code through Open-Meteo geocoding or activate “Use my location.” Device location is requested only after that activation. A denied or unavailable request leaves manual search available. The search interface shows at most one recent location.

**Acceptance check:** Clear site storage, load the app, and confirm that no default forecast or permission prompt appears. Select a manual result and a device location successfully. Deny device permission and confirm that a clear message and manual search remain available. Confirm that the dialog never shows more than one recent location.

### R2. Date range and units

The User can select today or any of the next six dates. The selector explicitly invites choosing a day; at narrow widths, larger buttons scroll horizontally with a visible sideways-swipe cue. The chosen date is visibly selected on phone and laptop. Temperatures default to °F; a visible °F/°C control converts every displayed temperature without changing recommendation thresholds, which are evaluated in °F.

**Acceptance check:** Confirm that exactly seven consecutive local dates are offered, that each can be selected, and that the selected state is exposed visually and programmatically. Toggle units and verify all displayed temperature values convert while the recommendation state remains unchanged.

**Peer-finding revision check:** On a phone and laptop, confirm that the date section clearly signals its buttons are actionable; on the phone, later dates can be reached by horizontal swipe without cramped tap targets or clipped content. Selecting a later day updates the weather and outfit, and the chosen button remains visibly and programmatically selected. Recheck at 200% browser zoom and with keyboard focus.

### R3. Live weather data and summary

Open-Meteo is the sole weather provider. Requests use the selected coordinates and location-local timezone. The app requests the current condition, temperature, and apparent temperature; hourly apparent temperature, precipitation probability, snowfall, weather code, and sustained wind; and daily high, low, weather code, and maximum UV index.

For today, the summary identifies the data as **Current** and shows the current condition, current temperature, current apparent temperature, forecast high and low, full date, location, units, update time, and Open-Meteo credit. For a later date, it identifies the data as **Forecast** and shows the forecast condition, high and low, average 8:00 AM–8:00 PM apparent temperature, full date, location, units, and credit.

**Acceptance check:** Compare a today response and a future-date response with the corresponding Open-Meteo payload. Confirm that every displayed value comes from that payload, the correct Current/Forecast label appears, and location, date, units, and provider are visible.

### R4. Main recommendation and shared state

One recommendation state contains the selected location and date, base category, representative condition, active modifiers, primary visual modifier, outfit variation, reminder wording variations, and Forecast Change callout. The weather summary, complete mascot outfit, weather icon, written recommendation, reminder cards, and callout all render from this state. The mascot is the visual focus. At most one modifier determines its complete illustration; other active conditions remain visible in the weather summary, reminders, and written guidance. Written guidance distinguishes what the mascot wears from additional attire or items recommended to the User.

**Acceptance check:** Test data fixtures for every category and modifier. For each fixture, inspect the state and confirm that every visual and written output agrees with it; no output uses an independent weather rule.

### R5. Reminder cards

The reminder area always shows four labeled, non-interactive cards: umbrella, water-resistant shoes, sunscreen, and water. Active cards use full contrast and show one eligible wording variation. Inactive cards are dimmed while their labels remain readable. When none are active, the section shows “No weather extras needed today.” A sun hat or sunglasses on the mascot do not replace or add to the sunscreen card.

**Acceptance check:** Test no-modifier, precipitation, snow, high-UV, and heat fixtures. Confirm the correct cards and copy activate, inactive labels remain readable, exactly four cards exist, and the no-extras message appears only when none are active.

### R6. Forecast Change feature

The callout evaluates 8:00 AM–8:00 PM in the location's local time. For today, it compares upcoming hours with the current hour; for a future date, it compares later hours with 8:00 AM. Rain is considered likely when an hourly rain weather code is reported or precipitation probability reaches 30%. The callout reports the first supported rain start and stop transitions in that window, or the first time snow begins. A daily rain code without a supported hourly transition produces an explicit timing-unavailable message, never an invented hour. Rain or snow leads the callout; a meaningful apparent-temperature change of at least 10°F may follow as a separate bullet sentence. The temperature difference uses the selected display unit. If no event is supported, it says conditions should stay fairly steady. UV alone does not trigger the callout.

**Acceptance check:** Use fixtures for rain start, rain stop, a complete rain interval, daily rain without hourly timing, snow, warming, cooling, competing precipitation and temperature changes, high UV only, and no meaningful change. Confirm the expected priority, direction, approximate time, timing-unavailable, and steady-state wording.

### R7. Responsive layout and navigation

PUPCAST has two screens: Home and About. A manual-location interface opens as a dialog on laptop and a bottom sheet on phone. Phone content stacks vertically; the header provides the information control, About provides Back, and sticky location/date shortcuts remain within thumb reach. Laptop uses a two-column main layout with the mascot beside weather and recommendation details, plus Home/About header navigation. No Settings screen, outfit carousel, shopping flow, or persistent phone screen-navigation bar is included.

**Acceptance check:** At representative phone and laptop widths, compare the result with the linked drawings and interpretation notes. Confirm there are only two screens, the search interface opens and closes using its documented controls, the mascot remains prominent, the phone shortcuts stay reachable, and the laptop uses two columns rather than an enlarged phone stack.

### R8. Accessibility

The implementation targets WCAG 2.2 AA: at least 4.5:1 contrast for normal text; no weather, reminder, error, or selected state conveyed by color alone; semantic headings and controls; keyboard operation and logical focus order; visible focus; meaningful alternative text for informative art and empty alternative text for decoration; announced loading and error updates; and interactive targets at least 24 by 24 CSS pixels, with larger primary phone controls where practical. Motion respects `prefers-reduced-motion`.

**Acceptance check:** Run an automated accessibility audit and manually test keyboard-only use, visible focus, focus containment and return for the dialog, screen-reader names/status announcements, 200% zoom, contrast, reduced motion, and target sizes on both screens.

### R9. Loading, missing data, and failures

Initial loading, in-place weather updates, no location results, weather-service failure, incomplete data, locating, and denied permission each receive a clear status. An update keeps the last successful content visible but dimmed. A service failure offers Retry and may retain last successful in-memory data with a stale notice. Missing secondary values are omitted and identified as unavailable; missing apparent-temperature data for the entire evaluation window prevents an outfit recommendation rather than inventing a value. A hot-category day with reported snow is treated as inconsistent forecast data: preserve the reported summary, withhold the outfit recommendation, explain the inconsistency, and offer Retry.

**Acceptance check:** Simulate every listed state. Confirm the status is visible and announced, controls remain usable where appropriate, Retry repeats the request, stale data is identified, missing values are never displayed as zero, and no recommendation is produced without enough apparent-temperature data to select a category.

### R10. Information, methods, and credits

The About screen identifies Chelsea Lee as creator; credits Open-Meteo with a working provider link; summarizes category and modifier methods, limitations, and weather-guidance sources from `research.md`; explains privacy; and credits the original concept, PUPCAST name, main laptop layout, and Bichon character design to Chelsea Lee. It discloses that ChatGPT assisted with responsive and state-design references based on her original visual, Codex by OpenAI assisted with research, specification, planning, and coding, and AI may assist production-art variations that Chelsea Lee reviews.

**Acceptance check:** Verify every required section on phone and laptop, test all source links, compare claims with `research.md` and the asset record, and confirm the page does not imply endorsement by Open-Meteo or OpenAI.

### R11. Privacy and persistence

PUPCAST has no accounts, analytics, advertising, or application cookies. It stores only the most recent location label and coordinates in `localStorage`; selecting another location replaces them. If storage is blocked, the current session continues without persistence. Device coordinates are requested only after User action and sent to Open-Meteo for location-specific weather. The About screen discloses local storage, Open-Meteo's possible API logging, and GitHub Pages' security logging. Deterministic content selection requires no stored outfit history.

**Acceptance check:** Inspect storage and network activity after manual and device location selection. Confirm only one location record exists, replacement works, blocked storage does not break the session, no permission request occurs without activation, and no analytics, advertising, or application-cookie requests occur.

### R12. Deployment

The app is a static browser application deployed to a public GitHub Pages HTTPS URL. No secret API key is shipped to the browser. Open-Meteo's prototype terms and license must be reviewed before any commercial Client campaign.

Production URL: https://chelseajylee13.github.io/Project-3-Demo/. Deployment method: a push to `main` runs `.github/workflows/deploy-pages.yml`, which installs dependencies, runs the tests, builds `dist/`, and publishes that directory with GitHub Actions. The first successful workflow was [run 38095923911](https://github.com/chelseajylee13/Project-3-Demo/actions/runs/38095923911) for revision `a584a2a`; public-page and real-device acceptance checks are tracked in `plan.md`.

**Acceptance check:** Load the public URL on a real phone and laptop, confirm HTTPS and device-location availability, inspect the built files for secrets, and repeat the core location, date, recommendation, About, and error checks against the deployed version.

### Verification record — October 10, 2026

This is an evidence inventory, not a claim that every acceptance check has passed. `npm test` passed 89/89 tests across six files, and `npm run build` succeeded on October 10. The Developer's browser observations and the GitHub Pages audit are recorded chronologically in `plan.md`. “Partial” identifies the exact check still needed.

| Requirement | Result and evidence | Remaining check |
| --- | --- | --- |
| R1 · First use/location | **Verified.** `tests/foundation.test.js` and `tests/weather-controller.test.js` verify no invented default forecast, manual/device selection, and permission-denial fallback. The deployed laptop test confirmed city search and activated geolocation. In a fresh Edge InPrivate window, the Developer confirmed no forecast or permission prompt before selection and exactly one recent-location row after selecting a city. | No gap identified in the specified acceptance check. |
| R2 · Seven dates/units | **Verified.** `tests/weather-controller.test.js` selects all seven provider-local dates in Austin, New York, and Los Angeles fixtures; recommendation tests verify every today/future summary temperature converts to °C without changing the outfit, and Forecast Change has a separate Celsius test. The Developer confirmed all seven date controls and the °F/°C display worked on the deployed site; source review shows each date and unit button exposes `aria-pressed`. After the peer-finding revision, the Developer reviewed the deployed selector on phone and laptop, confirmed later-day selection and phone swipe reach work with weather/outfit updates, and confirmed keyboard operation and usability at 200% zoom. | No gap identified in the specified acceptance check. |
| R3 · Provider summary | **Verified.** `tests/live-data-adapters.test.js` verifies requested fields/units; `tests/recommendation-state.test.js` compares exact today/future summary fields with a controlled payload. Live requests on October 10 returned seven dates (October 10–16) in `America/Chicago`, `America/New_York`, and `America/Los_Angeles` for Austin, New York, and Los Angeles respectively. A separate live Austin response was normalized through the production domain code: today (October 10) and tomorrow (October 11) matched provider high/low, current temperature/apparent temperature, later-day 8 AM–8 PM apparent-temperature average, dates, and timezone. Source review of `src/views/renderHome.js` confirms the visible summary reads those state fields directly and labels Current/Forecast, unit, location, update time, and Open-Meteo credit; the Developer confirmed the deployed summary renders. | No gap identified in the specified acceptance check. |
| R4 · Shared recommendation | **Verified by deterministic fixtures, source inspection, and reviewed art.** `tests/recommendation-state.test.js` now exercises all 29 eligible primary-modifier/category pairs and asserts matching category, primary modifier, image path, image description, written recommendation, and mascot alternative text. Separate fixtures cover all six base categories, all five simultaneous modifiers with snow priority and secondary rain/UV/heat reminders, unavailable states, and stable independent variations. The Developer approved the production images; `src/views/renderHome.js` renders the weather icon, summary, mascot, recommendation, reminders, and Forecast Change from the same recommendation state. | No gap identified in the specified fixture/state comparison. |
| R5 · Reminders | **Verified by deterministic tests and Developer review.** `tests/recommendation-state.test.js` now checks all four reminder slots, active text, and the no-extras state under no-modifier, rain, snow, high-UV, heat, and combined fixtures. The Developer approved active/inactive card styling; `src/views/renderHome.js` renders the four cards and no-extras text directly from recommendation state. | No gap identified in the specified fixture set. |
| R6 · Forecast Change | **Verified by deterministic tests.** `tests/forecast-change.test.js` covers rain start/stop/interval, untimed daily rain, snow onset, warming, cooling, precipitation priority, today's baseline, and steady wording. `tests/recommendation-state.test.js` covers separate bullets and Celsius conversion. | No gap identified in the specified fixture set. |
| R7 · Responsive layout | **Verified by Developer review.** Phone/laptop Home and About, location dialog/bottom sheet, navigation, and sticky shortcuts were reviewed against drawings 34–41; the deployed phone/laptop smoke checks passed. See `plan.md` Checkpoints 5–6. | No gap identified for the specified layout/navigation check. |
| R8 · Accessibility | **Partial.** The Developer confirmed keyboard navigation, dialog focus return, Narrator error announcement, 200% zoom, reduced motion, and phone shortcuts. Production-preview mobile Home Lighthouse Accessibility scored 100; contrast and target sizes were reviewed in Checkpoint 5. | Run an automated accessibility audit on deployed About and inspect screen-reader names and selected states on both deployed screens. |
| R9 · Failure states | **Partial.** Controller tests cover loading, updating, no results, denied/unavailable location, service failure/Retry, stale data, missing apparent temperature, and inconsistent hot+snow data. The Developer confirmed stale Retry messaging and one Narrator announcement. | Record visual and announced behavior for every failure fixture, including incomplete values and hot+snow, and repeat a deployed error check. |
| R10 · Information/credits | **Verified by source and Developer review.** About contains creator, provider, methods, limitations, sources, privacy, and AI/design credits; the Developer reviewed phone/laptop layout and the previously broken OSHA link was corrected and reopened. See `plan.md` Checkpoint 5 notes and the asset credits below. | No gap identified for the specified content/link check. |
| R11 · Privacy/persistence | **Partial.** Adapter tests cover replacement and blocked storage. DevTools on localhost showed one location record; deployed DevTools showed GitHub Pages/Open-Meteo requests and an empty cookie table. Device permission was requested only after activation in tests and deployed review. | Inspect deployed `localStorage` after replacing a city and, if feasible, confirm blocked-storage behavior in a browser session. |
| R12 · Deployment | **Partial.** The public HTTPS URL loaded on a Dell XPS/Windows/Edge and iPhone 18 Pro/Google browser; laptop geolocation, search, date, About, persistence, and Retry worked. Built/served text scans found no obvious secret-shaped tokens. GitHub Actions run `38097408732` published revision `dc24bca`. | Repeat a failure/error-state check on the deployed app and confirm the phone browser's exact product name if needed for the device record. |

## Recommendation state and data flow

1. Obtain a manual geocoding result or User-approved device coordinates; restore the one saved location when available.
2. Fetch seven local days from Open-Meteo and normalize the required current, hourly, and daily values in °F and mph. Display conversion to °C happens after recommendation calculations.
3. For the selected date, average available hourly apparent temperatures from 8:00 AM through 8:00 PM local time and select one base category:

   | Category | Average apparent temperature |
   | --- | --- |
   | Hot | 85°F or above |
   | Warm | 70–84°F |
   | Mild | 55–69°F |
   | Cool | 40–54°F |
   | Cold | 20–39°F |
   | Very cold | Below 20°F |

4. Apply modifiers from provider values within the same local-time window:

   | Modifier | Trigger | Required effects |
   | --- | --- | --- |
   | Rain | Current (for today), daily, or hourly rain weather code, or maximum hourly precipitation probability ≥30% | Integrated rain shell, umbrella, and water-resistant shoes when primary; rain condition treatment and umbrella/shoe reminders whenever active |
   | Snow | Any reported snowfall or current (for today), daily, or hourly snow-related weather code | Integrated insulated outerwear and waterproof boots when primary; snow condition treatment, shoe reminder, and snow guidance whenever active |
   | High UV | Daily maximum UV index ≥3 | Sunglasses worn over both eyes, with a sun hat where temperature-appropriate, when primary; sunscreen reminder whenever active |
   | Heat | Any hourly apparent temperature ≥80°F | Visible water bottle when primary; hydration reminder whenever active |
   | Wind | Maximum sustained hourly wind ≥15 mph | Integrated wind-resistant outer layer when primary; matching written guidance whenever active |

   If several modifiers are active, select the mascot's one primary complete outfit in this order: snow, rain, wind, high UV, heat. Lower-priority active conditions remain in the weather summary, written guidance, and applicable reminders. The Developer approved this priority on 2026-10-05. No hot + snow illustration is produced. If provider data indicates both a hot category and snow, mark recommendation state unavailable with reason `inconsistent-weather-data`; retain the summary values and show a retryable warning instead of an outfit.

5. Build one immutable recommendation state. Use separately salted deterministic hashes of location coordinates and ISO date to choose the base-outfit index and each active reminder's wording index. The same location and date therefore keep the same independent variations after navigation, reload, or reopening. If updated provider data changes eligibility, outputs update to the new state while retaining the deterministic index within each category or reminder type.
6. Derive the Forecast Change callout using R6, then render every visual and written output from the completed state.

## Content variation

### Outfit variations

All outfits are gender-inclusive campus basics. Weather-specific looks are complete character illustrations, never layers composited over a base outfit. When several modifiers are active, one primary modifier determines the illustration and secondary conditions appear in the interface copy and reminders. The existing three variations per category apply on days with no visual modifier; modified days have one complete look per eligible primary-modifier and temperature-category pair. No hot-base snow illustration is produced.

| Category | Variation 1 | Variation 2 | Variation 3 |
| --- | --- | --- | --- |
| Hot | Sleeveless top, athletic shorts, sneakers | Lightweight tank top, loose shorts, sneakers | Lightweight short-sleeve shirt, airy pants, sneakers |
| Warm | T-shirt, shorts, sneakers | T-shirt, lightweight jeans, sneakers | Polo or casual shirt, lightweight pants, sneakers |
| Mild | Hoodie, jeans, sneakers | Crewneck sweatshirt, casual pants, sneakers | Light denim jacket over a T-shirt, jeans, sneakers |
| Cool | Sweater, jeans, closed-toe shoes | Hoodie under a light jacket, pants, sneakers | Long-sleeve shirt with an overshirt, pants, closed-toe shoes |
| Cold | Puffer jacket over a sweater, pants, boots | Wool-style coat over a hoodie, jeans, boots | Insulated jacket, knit top, pants, boots |
| Very cold | Parka, thermal layers, insulated pants, winter boots, hat, gloves, scarf/neck warmer | Long puffer, sweater, thick pants, boots, hat, gloves, scarf/neck warmer | Heavy jacket over a hoodie, fleece-lined pants, winter boots, hat, gloves, scarf/neck warmer |

### Reminder wording

| Reminder | Variation 1 | Variation 2 | Variation 3 |
| --- | --- | --- | --- |
| Umbrella | Bring an umbrella—rain is possible today. | Keep an umbrella nearby for possible showers. | Pack an umbrella before heading to campus. |
| Water-resistant shoes | Choose water-resistant shoes for wet conditions. | Wet sidewalks are possible, so protect your feet. | Wear shoes that can handle rain or snow. |
| Sunscreen | Apply sunscreen before heading outside. | UV levels call for sun protection today. | Remember sunscreen for time between classes. |
| Hydration | Carry water and stay hydrated today. | Warm conditions make a water bottle a good idea. | Bring water for your time on campus. |

## Assets

| Asset group | Quantity and use | Format | Creation and credit |
| --- | --- | --- | --- |
| Original Bichon design | One master character establishing silhouette, proportions, and visual direction | Transparent PNG master | Original design by Chelsea Lee |
| Base outfit renderings | 18 complete, aligned mascot renderings: three for each temperature category | Transparent PNG | Original-led; AI may assist variations based on Chelsea Lee's design; each result reviewed by Chelsea Lee and disclosed |
| Integrated weather outfits | 29 complete character renderings: one for each of five primary modifiers across six temperature categories, except hot + snow; secondary modifiers use interface copy and reminders | Transparent PNG | Original-led, with the same AI-assistance review and credit as base outfit renderings |
| Weather icons | Clear, partly cloudy, overcast, fog, rain, snow, thunderstorm | SVG | Created for PUPCAST from the approved visual direction; credit Chelsea Lee and disclose AI assistance if used |
| Reminder icons | Umbrella, water-resistant shoes, sunscreen, water | SVG | Created for PUPCAST from the approved visual direction; credit Chelsea Lee and disclose AI assistance if used |
| Interface icons | Location, search, close, calendar, information, Back, external link, retry, and loading/status symbols | SVG/CSS | Created for PUPCAST; if replaced with a library, record the library and license here before use |

Reference images 01–09 and AI-assisted concept images 10–17 are inspiration or process records only and must not ship as app assets. Final asset filenames, dimensions, and any third-party license details must be added here when assets are produced.

### Production asset record

The approved full-resolution PNGs below remain the production masters. The app now references mechanically resized transparent PNG delivery copies in `src/assets/delivery/`: 768 × 1152 for the master and complete outfits, and 160 × 160 for the logo. `scripts/create-delivery-pngs.ps1` records the repeatable resize method; visual review of the delivery copies is pending. This addresses the 2026-10-10 production-preview Lighthouse payload finding without changing the approved source artwork.

| File | Dimensions | Production method | Review and credit |
| --- | --- | --- | --- |
| `src/assets/brand/pupcast-logo.png` | 2000 × 2000 transparent PNG | Developer-supplied PUPCAST Bichon-face logo; upstream production method not independently verified | Supplied and approved by Chelsea Lee on 2026-10-10 for the shared Home/About header. The adjacent PUPCAST wordmark provides the accessible name, so the image uses empty alternative text. |
| `src/assets/fonts/nunito/variable/nunito-latin-wght-{normal,italic}.woff2` | Variable Latin WOFF2 fonts, 200–900 weight range | Developer-supplied Fontsource Nunito ZIP; original Nunito Project Authors | Chelsea Lee selected Nunito for the site-wide typeface on 2026-10-10. SIL Open Font License 1.1; source license retained at `src/assets/fonts/nunito/LICENSE` and distributed at `public/licenses/Nunito-OFL.txt`. Font files are self-hosted; no third-party font request is made. |
| `src/assets/character/master-bichon.png` | 1024 × 1536 transparent PNG | Built-in OpenAI image generation using drawing 35 as Chelsea Lee's character-design anchor, followed by a transparency-cleanup edit | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character design and visual direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/hot-1.png` through `hot-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master; variation 3 received a Developer-directed Hawaiian-shirt revision | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/warm-1.png` through `warm-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/mild-1.png` through `mild-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master; variation 2 received Developer-directed white vintage `COLLEGE` lettering and variation 3 received a beige-jeans revision | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/cool-1.png` through `cool-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/cold-1.png` through `cold-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/very-cold-1.png` through `very-cold-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits plus composition and transparency cleanup attempts | Visually reviewed and accepted by Chelsea Lee on 2026-10-05 for the fastest implementation path. Minor peripheral alpha and differing figure bounds will be normalized with consistent application-level `object-fit`/`object-position`. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/weather/high-uv-{hot,warm,mild,cool,cold,very-cold}.png` | Six 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the respective approved base outfits, using the approved warm high-UV look as an accessory reference | Chelsea Lee approved the six-look high-UV family on 2026-10-05. Sunglasses cover both eyes in every category; cold and very-cold clothing remains temperature-appropriate. Original Bichon design and visual direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/weather/rain-{hot,warm,mild,cool,cold,very-cold}.png` | Six 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the respective approved base outfits, using the mild integrated rain look as an accessory reference; hot and warm footwear received targeted waterproof-rubber revisions | Chelsea Lee approved the six-look rain family on 2026-10-05. Each complete character wears rain protection, holds an umbrella, and wears water-resistant footwear. Original Bichon design and visual direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/weather/snow-{warm,mild,cool,cold,very-cold}.png` | Five 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the respective approved base outfits, using the cold integrated snow look as a winterwear reference; cold gloves and the very-cold green scarf received targeted edits | Chelsea Lee approved the revised five-look snow family on 2026-10-05. No hot + snow artwork exists. Original Bichon design and visual direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/weather/wind-{hot,warm,mild,cool,cold,very-cold}.png` | Six 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the respective approved base outfits, using the cool integrated wind look as a windwear reference | Chelsea Lee approved the six-look wind family on 2026-10-09. Original Bichon design and visual direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/weather/heat-{hot,warm,mild,cool,cold,very-cold}.png` | Six 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the respective approved base outfits, using the hot integrated heat look as a water-bottle reference | Chelsea Lee approved the six-look heat family on 2026-10-09. Original Bichon design and visual direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/modifiers/rain.png`, `snow.png`, `wind.png`, `high-uv.png`, and `heat.png` | 1024 × 1536 transparent PNG overlays | Built-in OpenAI generation using the approved master Bichon as an alignment and style reference | Initially approved in isolation, then rejected by Chelsea Lee after combined previews showed the garments sitting over the base outfits. Retained only as process evidence; not for use in the finished app. |
| `src/assets/character/modifiers/umbrella.png` | 1024 × 1536 transparent PNG overlay | Built-in OpenAI edit isolating the umbrella from the rain overlay | Combined preview rejected with the overlay approach. Process evidence only; not for use in the finished app. |
| `reference/integrated-cold-snow-rain-sample-v1.png` | 1024 × 1536 transparent PNG | Built-in OpenAI identity-preserving edit of the approved cold-2 base outfit | Developer-approved visual direction for a complete character rendering with genuinely worn outerwear. Review sample only; it does not ship. |

The Developer rejected all composited modifier overlays after stacked review. A primary-condition complete-character illustration replaces them; secondary active conditions are communicated in interface copy and reminders. The Developer excluded hot-base snow artwork. An inconsistent hot-plus-snow provider payload does not produce an outfit recommendation; the interface preserves the reported summary and offers Retry with a clear data warning.
| `src/assets/icons/weather/*.svg` | Seven 64 × 64 viewBox weather icons | Hand-authored SVGs using the approved PUPCAST palette and rounded illustration language | Reviewed and approved by Chelsea Lee on 2026-10-05. Credit Chelsea Lee's visual direction. Use the normalized condition as alternative text only when the icon conveys information independently. |
| `src/assets/icons/reminders/*.svg` | Four 64 × 64 viewBox reminder icons | Hand-authored SVGs using the approved PUPCAST palette and rounded illustration language | Reviewed and approved by Chelsea Lee on 2026-10-05. Credit Chelsea Lee's visual direction. Use empty alternative text because each card has a visible label. |
| `src/assets/icons/interface/*.svg` | Ten 24 × 24 viewBox interface, loading, and status icons | Hand-authored current-color stroke SVGs | Reviewed and approved by Chelsea Lee on 2026-10-05. Icon-only controls receive programmatic names; icons accompanying visible text and live-region copy are decorative. |

## Out of scope

- Accounts, profiles, and cloud synchronization
- Multiple saved locations or location history beyond one recent location
- Locations outside the United States
- Personalized wardrobes, sizing, shopping, or checkout
- Calendar or class-schedule integration
- Push notifications
- Detailed hourly forecast browsing
- Severe-weather alerts, medical guidance, or travel-safety decisions
- Analytics, advertising, and application cookies
- Commercial campaign use without reviewing Open-Meteo's license and service plan

## Revisions

- 2026-10-10: Chelsea Lee supplied and approved the transparent Bichon-face PUPCAST logo for the shared Home/About header, replacing the temporary emoji. The original 2000 × 2000 PNG is retained without generative edits; CSS sizes it for phone and laptop headers.
- 2026-10-10: Chelsea Lee requested that every Forecast Change sentence appear on its own bullet line and that temperature differences follow the selected °F/°C setting even when rain timing is also reported. The callout now carries separate message items so presentation and conversion do not depend on splitting or replacing an aggregated paragraph.
- 2026-10-10: Chelsea Lee observed a rainy daily forecast paired with a non-rain outfit and inactive rain reminders. The approved rain trigger now includes daily and hourly rain weather codes, in addition to the existing hourly probability threshold. Forecast Change now reports supported hourly rain start/stop transitions, states when timing is unavailable, and may add a meaningful temperature shift after the rain message. No start or stop time is inferred from a daily code alone.
- 2026-10-05: Initial specification draft reconciled the approved research, Developer decisions, and hand-drawn references. Interpretation notes resolve remaining placeholder conflicts in the drawings.

After implementation or testing, record requirement changes and the evidence that prompted them. Update the screen drawings when a material layout or interaction changes.

## Approval

The Developer reviews and explicitly approves this specification and its screen designs before planning begins.

- [x] Goal, requirements, rules, content, assets, and out-of-scope decisions reviewed and approved by the Developer on 2026-10-05
- [x] Screen drawings and interpretation notes reviewed and approved by the Developer on 2026-10-05
- [x] Specification approved by the Developer on 2026-10-05; the project may proceed to implementation planning

## Saving the transcript

After the Developer approves the specification, ask them to enter `save transcript`. When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.
