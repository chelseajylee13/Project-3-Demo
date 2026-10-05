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
- High UV activates the sunscreen reminder and sun-hat modifier but does not trigger the Forecast Change callout. That callout uses only the temperature, rain, and snow rules defined below.
- The most recent location label and coordinates are stored in the browser as described under Privacy, despite contradictory placeholder copy in one drawing.

## Requirements

### R1. First use and location selection

On first use, PUPCAST shows a location-selection state rather than default weather. The User can search for a US city or ZIP code through Open-Meteo geocoding or activate “Use my location.” Device location is requested only after that activation. A denied or unavailable request leaves manual search available. The search interface shows at most one recent location.

**Acceptance check:** Clear site storage, load the app, and confirm that no default forecast or permission prompt appears. Select a manual result and a device location successfully. Deny device permission and confirm that a clear message and manual search remain available. Confirm that the dialog never shows more than one recent location.

### R2. Date range and units

The User can select today or any of the next six dates. The chosen date is visibly selected on phone and laptop. Temperatures default to °F; a visible °F/°C control converts every displayed temperature without changing recommendation thresholds, which are evaluated in °F.

**Acceptance check:** Confirm that exactly seven consecutive local dates are offered, that each can be selected, and that the selected state is exposed visually and programmatically. Toggle units and verify all displayed temperature values convert while the recommendation state remains unchanged.

### R3. Live weather data and summary

Open-Meteo is the sole weather provider. Requests use the selected coordinates and location-local timezone. The app requests the current condition, temperature, and apparent temperature; hourly apparent temperature, precipitation probability, snowfall, weather code, and sustained wind; and daily high, low, weather code, and maximum UV index.

For today, the summary identifies the data as **Current** and shows the current condition, current temperature, current apparent temperature, forecast high and low, full date, location, units, update time, and Open-Meteo credit. For a later date, it identifies the data as **Forecast** and shows the forecast condition, high and low, average 8:00 AM–8:00 PM apparent temperature, full date, location, units, and credit.

**Acceptance check:** Compare a today response and a future-date response with the corresponding Open-Meteo payload. Confirm that every displayed value comes from that payload, the correct Current/Forecast label appears, and location, date, units, and provider are visible.

### R4. Main recommendation and shared state

One recommendation state contains the selected location and date, base category, representative condition, active modifiers, outfit variation, reminder wording variations, and Forecast Change callout. The weather summary, mascot outfit and accessories, weather icon, written recommendation, reminder cards, and callout all render from this state. The mascot is the visual focus. Written guidance describes the User's attire and matches the visible mascot outfit.

**Acceptance check:** Test data fixtures for every category and modifier. For each fixture, inspect the state and confirm that every visual and written output agrees with it; no output uses an independent weather rule.

### R5. Reminder cards

The reminder area always shows four labeled, non-interactive cards: umbrella, water-resistant shoes, sunscreen, and water. Active cards use full contrast and show one eligible wording variation. Inactive cards are dimmed while their labels remain readable. When none are active, the section shows “No weather extras needed today.” A sun hat or sunglasses on the mascot do not replace or add to the sunscreen card.

**Acceptance check:** Test no-modifier, precipitation, snow, high-UV, and heat fixtures. Confirm the correct cards and copy activate, inactive labels remain readable, exactly four cards exist, and the no-extras message appears only when none are active.

### R6. Forecast Change feature

The callout evaluates 8:00 AM–8:00 PM in the location's local time. For today, it compares upcoming hours with the current hour; for a future date, it compares later hours with 8:00 AM. It reports the approximate first time that precipitation probability crosses from below 30% to at least 30%, snow begins, or apparent temperature differs from the baseline by at least 10°F. Snow or rain takes priority over temperature. If no threshold is crossed, it says conditions should stay fairly steady. UV alone does not trigger the callout.

**Acceptance check:** Use fixtures for rain, snow, warming, cooling, competing precipitation and temperature changes, high UV only, and no meaningful change. Confirm the expected priority, direction, approximate time, and steady-state wording.

### R7. Responsive layout and navigation

PUPCAST has two screens: Home and About. A manual-location interface opens as a dialog on laptop and a bottom sheet on phone. Phone content stacks vertically; the header provides the information control, About provides Back, and sticky location/date shortcuts remain within thumb reach. Laptop uses a two-column main layout with the mascot beside weather and recommendation details, plus Home/About header navigation. No Settings screen, outfit carousel, shopping flow, or persistent phone screen-navigation bar is included.

**Acceptance check:** At representative phone and laptop widths, compare the result with the linked drawings and interpretation notes. Confirm there are only two screens, the search interface opens and closes using its documented controls, the mascot remains prominent, the phone shortcuts stay reachable, and the laptop uses two columns rather than an enlarged phone stack.

### R8. Accessibility

The implementation targets WCAG 2.2 AA: at least 4.5:1 contrast for normal text; no weather, reminder, error, or selected state conveyed by color alone; semantic headings and controls; keyboard operation and logical focus order; visible focus; meaningful alternative text for informative art and empty alternative text for decoration; announced loading and error updates; and interactive targets at least 24 by 24 CSS pixels, with larger primary phone controls where practical. Motion respects `prefers-reduced-motion`.

**Acceptance check:** Run an automated accessibility audit and manually test keyboard-only use, visible focus, focus containment and return for the dialog, screen-reader names/status announcements, 200% zoom, contrast, reduced motion, and target sizes on both screens.

### R9. Loading, missing data, and failures

Initial loading, in-place weather updates, no location results, weather-service failure, incomplete data, locating, and denied permission each receive a clear status. An update keeps the last successful content visible but dimmed. A service failure offers Retry and may retain last successful in-memory data with a stale notice. Missing secondary values are omitted and identified as unavailable; missing apparent-temperature data for the entire evaluation window prevents an outfit recommendation rather than inventing a value.

**Acceptance check:** Simulate every listed state. Confirm the status is visible and announced, controls remain usable where appropriate, Retry repeats the request, stale data is identified, missing values are never displayed as zero, and no recommendation is produced without enough apparent-temperature data to select a category.

### R10. Information, methods, and credits

The About screen identifies Chelsea Lee as creator; credits Open-Meteo with a working provider link; summarizes category and modifier methods, limitations, and weather-guidance sources from `research.md`; explains privacy; and credits the original concept, PUPCAST name, main laptop layout, and Bichon character design to Chelsea Lee. It discloses that ChatGPT assisted with responsive and state-design references based on her original visual, Codex by OpenAI assisted with research, specification, planning, and coding, and AI may assist production-art variations that Chelsea Lee reviews.

**Acceptance check:** Verify every required section on phone and laptop, test all source links, compare claims with `research.md` and the asset record, and confirm the page does not imply endorsement by Open-Meteo or OpenAI.

### R11. Privacy and persistence

PUPCAST has no accounts, analytics, advertising, or application cookies. It stores only the most recent location label and coordinates in `localStorage`; selecting another location replaces them. If storage is blocked, the current session continues without persistence. Device coordinates are requested only after User action and sent to Open-Meteo for location-specific weather. The About screen discloses local storage, Open-Meteo's possible API logging, and GitHub Pages' security logging. Deterministic content selection requires no stored outfit history.

**Acceptance check:** Inspect storage and network activity after manual and device location selection. Confirm only one location record exists, replacement works, blocked storage does not break the session, no permission request occurs without activation, and no analytics, advertising, or application-cookie requests occur.

### R12. Deployment

The app is a static browser application deployed to a public GitHub Pages HTTPS URL. No secret API key is shipped to the browser. Open-Meteo's prototype terms and license must be reviewed before any commercial Client campaign.

**Acceptance check:** Load the public URL on a real phone and laptop, confirm HTTPS and device-location availability, inspect the built files for secrets, and repeat the core location, date, recommendation, About, and error checks against the deployed version.

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
   | Rain | Maximum hourly precipitation probability ≥30% | Rain shell, umbrella, water-resistant shoes, rain icon/condition treatment, umbrella and shoe reminders |
   | Snow | Any reported snowfall or snow-related weather code | Insulated outerwear, waterproof boots, snow icon/condition treatment, shoe reminder and snow guidance |
   | High UV | Daily maximum UV index ≥3 | Sun hat or sunglasses on mascot and sunscreen reminder |
   | Heat | Any hourly apparent temperature ≥80°F | Visible water bottle and hydration reminder |
   | Wind | Maximum sustained hourly wind ≥15 mph | Wind-resistant outer layer and matching written guidance |

5. Build one immutable recommendation state. Use separately salted deterministic hashes of location coordinates and ISO date to choose the base-outfit index and each active reminder's wording index. The same location and date therefore keep the same independent variations after navigation, reload, or reopening. If updated provider data changes eligibility, outputs update to the new state while retaining the deterministic index within each category or reminder type.
6. Derive the Forecast Change callout using R6, then render every visual and written output from the completed state.

## Content variation

### Outfit variations

All outfits are gender-inclusive campus basics. Weather-modifier layers can alter any eligible base outfit.

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
| Weather-modifier layers | Rain shell, umbrella, water-resistant footwear, snow outerwear/boots, wind-resistant layer, sun hat/sunglasses, and water bottle | Transparent PNG | Original-led, with the same AI-assistance review and credit as outfit renderings |
| Weather icons | Clear, partly cloudy, overcast, fog, rain, snow, thunderstorm | SVG | Created for PUPCAST from the approved visual direction; credit Chelsea Lee and disclose AI assistance if used |
| Reminder icons | Umbrella, water-resistant shoes, sunscreen, water | SVG | Created for PUPCAST from the approved visual direction; credit Chelsea Lee and disclose AI assistance if used |
| Interface icons | Location, search, close, calendar, information, Back, external link, retry, and loading/status symbols | SVG/CSS | Created for PUPCAST; if replaced with a library, record the library and license here before use |

Reference images 01–09 and AI-assisted concept images 10–17 are inspiration or process records only and must not ship as app assets. Final asset filenames, dimensions, and any third-party license details must be added here when assets are produced.

### Production asset record

| File | Dimensions | Production method | Review and credit |
| --- | --- | --- | --- |
| `src/assets/character/master-bichon.png` | 1024 × 1536 transparent PNG | Built-in OpenAI image generation using drawing 35 as Chelsea Lee's character-design anchor, followed by a transparency-cleanup edit | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character design and visual direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/hot-1.png` through `hot-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master; variation 3 received a Developer-directed Hawaiian-shirt revision | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/warm-1.png` through `warm-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/mild-1.png` through `mild-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master; variation 2 received Developer-directed white vintage `COLLEGE` lettering and variation 3 received a beige-jeans revision | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/cool-1.png` through `cool-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/cold-1.png` through `cold-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits of the approved master | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/outfits/very-cold-1.png` through `very-cold-3.png` | 1024 × 1536 transparent PNGs | Built-in OpenAI identity-preserving edits plus composition and transparency cleanup attempts | Visually reviewed and accepted by Chelsea Lee on 2026-10-05 for the fastest implementation path. Minor peripheral alpha and differing figure bounds will be normalized with consistent application-level `object-fit`/`object-position`. Original character and outfit direction by Chelsea Lee; AI-assisted production disclosed under R10. |
| `src/assets/character/modifiers/rain.png`, `snow.png`, `wind.png`, `high-uv.png`, and `heat.png` | 1024 × 1536 transparent PNG overlays | Built-in OpenAI image generation using the approved master Bichon as an alignment and style reference; isolated rain protection, snow protection, wind layer, sun protection, and hydration accessories | Reviewed and approved by Chelsea Lee on 2026-10-05. Original character and modifier direction by Chelsea Lee; AI-assisted production disclosed under R10. Modifier layers receive empty alternative text; the composed mascot description names only recommendation-relevant clothing and accessories. |
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

- 2026-10-05: Initial specification draft reconciled the approved research, Developer decisions, and hand-drawn references. Interpretation notes resolve remaining placeholder conflicts in the drawings.

After implementation or testing, record requirement changes and the evidence that prompted them. Update the screen drawings when a material layout or interaction changes.

## Approval

The Developer reviews and explicitly approves this specification and its screen designs before planning begins.

- [x] Goal, requirements, rules, content, assets, and out-of-scope decisions reviewed and approved by the Developer on 2026-10-05
- [x] Screen drawings and interpretation notes reviewed and approved by the Developer on 2026-10-05
- [x] Specification approved by the Developer on 2026-10-05; the project may proceed to implementation planning

## Saving the transcript

After the Developer approves the specification, ask them to enter `save transcript`. When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.
