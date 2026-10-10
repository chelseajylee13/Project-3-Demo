# Implementation Plan

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved specification into an ordered, trackable build and verification plan.

## Instructions for the Developer

Set priorities, review the checklist, verify results rather than relying only on the Agent's report, and keep the project documents current as the work changes. Expect the build to take many rounds of testing and fixing; record material changes under Revisions.

To begin planning, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me create the Project 3 implementation plan.`

After approving the plan, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me implement the approved Project 3 plan in working checkpoints.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, `spec.md`, and this file, then inspect the relevant project files. Propose concrete tasks and checks without expanding the approved scope.

During implementation, follow the approved plan in working checkpoints and keep it current. Never mark approvals or items requiring Developer verification complete on the Developer's behalf.

## Approach

Build PUPCAST as a static Vite application using semantic HTML, responsive CSS, and modular vanilla JavaScript. Vitest will exercise pure data and recommendation functions with fixtures; browser and accessibility checks will cover behavior that depends on the DOM, device APIs, or responsive layout. GitHub Pages will host the production build over HTTPS.

The application will have four main layers:

1. **Services:** Open-Meteo geocoding and forecast requests, browser geolocation, and guarded `localStorage` access.
2. **Domain logic:** weather-response normalization, location-local date windows, category and modifier rules, deterministic variation selection, Forecast Change evaluation, and unit conversion for display.
3. **Application state:** one immutable recommendation state for the selected location and date, plus transient interface states such as loading, stale data, search results, and errors.
4. **Interface:** Home and About screens, the responsive search dialog/bottom sheet, weather summary, mascot and outfit, recommendation, four reminder cards, Forecast Change callout, and status messages.

Data flows from a User-selected or restored location through one forecast request and normalized seven-day model. Selecting a date derives one recommendation state. Every weather icon, garment and accessory, written recommendation, reminder, and Forecast Change message renders from that state. Fahrenheit values drive all rules; Celsius conversion occurs only when values are displayed. Separately salted hashes of coordinates and ISO date select each outfit and reminder variation without storing history.

Asset production begins alongside the application foundation because the 18 aligned base outfits and 29 integrated primary-weather outfits are the largest schedule dependency. The Agent may assist with controlled AI-generated variations based on Chelsea Lee's original Bichon design. The Developer reviews each set for authorship, visual consistency, alignment, legibility, and artifacts before it is used. Approved filenames, dimensions, production method, and credits are recorded in `spec.md`; reference drawings and images do not ship as application assets.

Work proceeds in the checkpoints below. Each checkpoint must run successfully, pass its listed checks, receive Developer review, and be committed before the next checkpoint begins. When implementation evidence changes an intended result, update `spec.md`; when it changes task order or execution, update this plan.

Main risks are inconsistent or late artwork, incorrect timezone/date slicing, incomplete Open-Meteo values, recommendation outputs diverging from the shared state, unstable network behavior, inaccessible dialog focus, crowded phone controls, and differences between the local and GitHub Pages builds. Address these with early asset review, pure fixture-tested logic, explicit missing-data paths, a single state builder, responsive checks at every interface checkpoint, and independent deployed testing.

## Checklist

### Approvals

- [x] Research approved by the Developer on 2026-10-04
- [x] Specification and final screen drawings approved by the Developer on 2026-10-05
- [x] Plan approved by the Developer on 2026-10-05

### Build

#### Checkpoint 1: Foundation and automated-test path

- [x] Scaffold a Vite vanilla JavaScript application with documented development, test, build, and preview commands
- [x] Add Vitest and organize readable modules for services, domain logic, state, views, styles, assets, and test fixtures without adding unneeded framework abstractions
- [x] Add a semantic two-screen shell, shared design tokens, responsive breakpoints, visible focus styles, reduced-motion handling, and a temporary first-use state
- [x] Configure a repository-relative production base and GitHub Pages deployment workflow without secrets
- [x] Add project-specific run, test, and deployment commands to `AGENTS.md`
- [x] Verify the development server, unit-test command, production build, and local production preview; inspect the built files for accidental credentials
- [x] Compare the shell at representative phone and laptop widths with the approved drawings and correct structural mismatches before Developer review
- [x] Commit the working foundation

#### Checkpoint 2: Reviewed production assets

- [x] Establish an asset manifest and fixed canvas/alignment rules from Chelsea Lee's original Bichon character design
- [x] Produce and review the transparent master character plus three base-outfit renderings for each of the six temperature categories
- [x] Replace the rejected overlay assets with 29 integrated primary-weather outfits: one per modifier and temperature category except hot + snow; review each set at phone and laptop sizes
- [x] Create and review the seven weather icons, four reminder icons, required interface icons, and loading/status artwork in SVG or CSS where specified
- [x] Check every raster asset at phone and laptop display sizes for consistent silhouette, alignment, transparent edges, clothing readability, and unwanted generation artifacts
- [x] Optimize final asset files, add meaningful alternative-text guidance to the asset manifest, and record filenames, dimensions, production method, review, and credits in `spec.md`
- [x] Confirm that no reference image or unreviewed generation output ships with the app
- [x] Commit the approved and documented production assets

#### Checkpoint 3: Weather and recommendation domain

- [x] Define weather and geocoding fixtures for all six categories; rain, snow, high UV, heat, and wind modifiers; combined modifiers; current and forecast dates; missing values; and every Forecast Change case
- [x] Implement WMO condition mapping and normalize Open-Meteo current, hourly, and daily payloads into one seven-day, location-local model
- [x] Implement the inclusive 8:00 AM-8:00 PM local evaluation window, average apparent temperature, category thresholds, modifier thresholds, and missing-data rules from `spec.md`
- [x] Implement separately salted deterministic hashes for the outfit and each eligible reminder, keyed by coordinates and ISO date
- [x] Implement Forecast Change baselines, crossings, direction, approximate time, precipitation-over-temperature priority, and steady-state wording
- [x] Finalize the immutable recommendation-state function with one integrated primary-weather outfit, secondary-condition guidance and reminders for the UI, accurate visible-outfit descriptions, and no composited modifier assets
- [x] Keep recommendation thresholds in Fahrenheit and implement Celsius as display-only conversion
- [x] Unit-test boundary values, DST/timezone handling, incomplete arrays, modifier combinations, independent variation selection, repeat visits, and changed eligibility
- [x] Run the full automated suite and inspect representative states before Developer review
- [x] Commit the tested domain layer

#### Checkpoint 4: Live data, location, persistence, and failures

- [x] Implement debounced US-only city/ZIP geocoding with result, no-result, service-error, cancellation, and race-condition handling
- [x] Implement browser geolocation only after explicit activation, including locating, success, denial, unavailable, and timeout states while retaining manual search
- [x] Implement guarded persistence of exactly one recent location label and coordinate pair; replacement removes the prior value and blocked storage leaves the session usable
- [x] Implement the exact Open-Meteo forecast request required by R3 with location-local timezone and seven dates
- [x] Connect restored, manual, and device locations to fetching, normalization, date selection, Retry, stale in-memory content, and missing-data handling
- [x] Implement exactly seven consecutive local date choices and a visible/programmatic selected state
- [x] Test live requests against Open-Meteo and test deterministic fixtures for offline, malformed, incomplete, slow, aborted, and out-of-order responses
- [x] Inspect storage and network activity to confirm there is one location record, no API key, and no analytics, advertising, or application-cookie traffic
- [x] Commit the working data flow

#### Checkpoint 5: Complete responsive and accessible interface

- [x] Build the Home screen from the approved phone and laptop drawings, including weather summary, prominent mascot, recommendation, exactly four reminder cards, Forecast Change, unit control, date selector, and Open-Meteo credit
- [x] Render all Home visual and written output only from the completed recommendation state; do not place independent weather rules in view components
- [x] Build the About screen with the complete creator, provider, methods, sources, limitations, privacy, design/art, and AI-assistance disclosures required by R10 and R11
- [x] Build the location interface as a laptop modal and phone bottom sheet with documented open/close controls, one recent location, result selection, keyboard operation, focus containment, and focus return
- [x] Implement phone stacking and thumb-reachable sticky location/date shortcuts, laptop two-column composition, and the screen-specific navigation defined in R7
- [x] Implement accessible initial loading, in-place updating, locating, denied permission, no results, service failure, stale content, and incomplete-data messages with appropriate live-region behavior
- [x] Add semantic landmarks/headings, control names and states, meaningful or empty alternative text, logical focus order, visible focus, and non-color cues
- [x] Compare every screen and state at representative phone and laptop widths with drawings 34-41, resolving conflicts in favor of the interpretation notes and requirements in `spec.md`
- [x] Run automated accessibility checks and manually verify keyboard use, dialog focus, status announcements, contrast, target sizes, reduced motion, and 200% zoom
- [x] Commit the complete locally verified interface

#### Checkpoint 6: Production deployment

- [ ] Run all automated tests, a clean production build, and the complete local specification checklist before deployment
- [ ] Deploy the production build to a public GitHub Pages HTTPS URL and record the URL and deployment method in the project documentation
- [ ] Verify that asset paths, routing, Open-Meteo requests, Retry, storage, and device geolocation work from the deployed subpath and secure context
- [ ] Inspect the deployed files and requests for secrets, unexpected third parties, analytics, advertising, and application cookies
- [ ] Test the deployed app independently on a real phone and laptop and record browser/device details and results
- [ ] Commit any deployment corrections and confirm that the deployed revision matches the repository

### Verify and revise

- [ ] Record an R1-R12 verification result with evidence for every acceptance check in `spec.md`
- [ ] Test multiple US locations and timezones, today and all six forecast dates, every recommendation category and modifier, combined modifiers, and every documented failure state
- [ ] Verify that eligible outfit and reminder variations are selected independently rather than as fixed pairs
- [ ] Verify that returning to a previously selected location/date after navigation, reload, and reopening shows the same eligible variations
- [ ] Test the deployed app, independently of the local version, on a real phone and a laptop, including both screens, accessibility, and one-handed controls
- [ ] Complete the usability-test protocol and blank session records below before recruiting participants
- [ ] Test with three peers and record each session
- [ ] Separate observations from interpretations, compare all three sessions, and identify the strongest repeated or high-impact finding
- [ ] Ask the Developer to choose the meaningful improvement supported by the findings
- [ ] Add the approved improvement and its acceptance check to this checklist; update `spec.md` first if the intended result changes
- [ ] Implement, verify, and redeploy at least one meaningful revision
- [ ] Repeat affected regression, accessibility, responsive, and deployed checks and record the evidence
- [ ] Commit the tested revision and confirm that the public URL serves it

### Deliver

- [ ] Confirm all brief deliverables and that `research.md`, `spec.md`, `plan.md`, and project run/deployment documentation match the finished app
- [ ] Test every external source/provider link and confirm the privacy statement, Open-Meteo prototype/licensing limitation, and GitHub Pages logging disclosure are accurate
- [ ] Confirm all shipped assets have creator, AI-assistance, or third-party license records as applicable
- [ ] Save planning, implementation, and later debrief chat transcripts in `transcripts/`
- [ ] Add and complete `debrief.md`

## Usability testing

Before testing, record the purpose, a few realistic tasks, non-leading prompts, and a consistent note format. For each session, use a non-identifying label and record the task, what the tester did or said, successes, barriers or questions, and possible changes. Keep observations separate from interpretations. After all three sessions, summarize the strongest findings and the improvement they support.

### Protocol

- **Purpose:** Determine whether a college-age User can select a location and date, understand the outfit and reminders, notice a meaningful forecast change, and find methods/privacy information without coaching.
- **Environment:** Test the deployed HTTPS app on the participant's or Developer's phone or laptop. Record device, browser, viewport/orientation, and whether location permission is allowed or denied; do not record identifying information.
- **Facilitation:** Ask the same tasks in order, avoid naming controls or explaining the interface, invite the participant to think aloud, and follow up with neutral prompts such as “What would you expect to happen?”
- **Success evidence:** Record whether the participant completes the task, where they hesitate or recover, what they say, and any accessibility or comfort issue. Do not treat completion alone as proof that the experience was clear.

### Tasks and prompts

1. “Set the app to show weather and an outfit for a US location you choose.”
2. “Check what the app recommends for a later day and explain why that outfit or any extra item is suggested.”
3. “Find out whether conditions are expected to change during that day.”
4. “Change the temperature unit, then return to the date you viewed before.”
5. “Find what weather service the app uses and what location information it saves.”
6. If appropriate for the session, deny device-location permission and ask, “How would you continue?”

### Session records

Complete one table per participant using labels P1, P2, and P3.

| Task | Observed actions and exact comments | Successes | Barriers or questions | Possible change |
| --- | --- | --- | --- | --- |
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |
| 5 |  |  |  |  |
| 6, if used |  |  |  |  |

### Findings and revision decision

- **Patterns across sessions:** To be completed after all three sessions.
- **Strongest findings:** To be completed after all three sessions.
- **Developer-approved improvement:** To be completed after review of the evidence.
- **Requirement and acceptance-check impact:** To be completed before implementation.
- **Revision verification:** To be completed after the updated public build is tested.

## Revisions

- 2026-10-10: Published the previously tested `c5a4b7c` revision to GitHub `main`. The first Pages workflow run completed install, all tests, and production build, but failed at `Configure GitHub Pages`; deploy was skipped and the public URL returned HTTP 404. The Developer needs to select GitHub Actions as the Pages source in repository Settings before a live verification can proceed. Checkpoint 6 deployment boxes remain open.
- 2026-10-10: Checkpoint 6 local release gate: `npm test` passed (89 tests) and `npm run build` produced 55 production files. A scan of the built text found no secret-shaped tokens, reference/review paths, analytics, or advertising scripts. The local branch is seven commits ahead of `origin/main`; GitHub CLI authentication is currently invalid, so public deployment and deployed-device verification have not yet been performed. No Checkpoint 6 box is checked on local evidence alone.
- 2026-10-10: Developer reviewed Home, About, no-result location search, and failed-Retry states at phone and laptop widths and reported clear messages and controls with no clipping or overlap and a fitting mascot. Combined with prior approval of the principal layout and the documented interpretation differences from drawings 34–41, this completes the cross-state visual comparison item. Only the scoped, secrets-checked interface commit remains for Checkpoint 5.
- 2026-10-10: Developer completed a keyboard-only Home→About→Home sweep, including date/unit controls and an About source link, and reported visible focus with no trap or unreachable control. Together with the confirmed dialog focus/return, Narrator failure announcement, reduced-motion shortcut, 200% zoom, source contrast/target review, and production-preview mobile Home Lighthouse Accessibility 100, the Checkpoint 5 accessibility-audit item is checked.
- 2026-10-10: Developer enabled Windows Narrator, triggered a failed offline Retry, and confirmed that the weather-update failure message was announced. Combined with the prior reduced-motion and 200% zoom checks, this closes the manual status-announcement subcheck.
- 2026-10-10: Developer used Edge's reduced-motion emulation on a phone-sized Home view and confirmed that the fixed date shortcut moves to the seven-day selector without animated scrolling. This completes the manual reduced-motion check.
- 2026-10-10: Developer confirmed the replacement About link opens OSHA's cold-stress page in Edge. The failed guide URL was replaced in the app and research record with `winter-weather/cold-stress`; Open-Meteo, EPA UV, NWS forecast-terms, and CDC heat links also opened in source audit. The About source-link check is complete.
- 2026-10-10: Developer agreed to keep stale forecast cards at normal readability after a failed Retry. The cards dim only during the in-place updating state; an offline failure may be too quick to see that transient fade. The persistent message explicitly says the last successful forecast is shown and Retry remains available. No design change is needed.
- 2026-10-10: Developer confirmed that an offline Retry displays the stale-weather message; controller tests and source review verify retention of the previous forecast. Source audit found page landmarks and headings, named controls with `aria-pressed`/`aria-current` selection cues, informative/decorative image alt text, visible `:focus-visible` styling, and DOM order matching the reading flow. About card body text contrast against its seven pastel backgrounds measures 5.67:1–6.01:1. The semantic/accessibility implementation item is checked; manual screen-reader, reduced-motion, and remaining cross-state checks stay in the separate audit item.
- 2026-10-10: Source audit confirms visible state messages for initial loading, in-place updating, locating, denied permission, no search results, service failure, stale content, and incomplete data. Persistent polite/urgent live regions announce weather-status changes; the search dialog has its own status region and incomplete data has a visible alert. A new controller test verifies loading → error → ready → updating → stale without losing the completed recommendation. All 89 tests pass. The status-implementation item is checked; manual screen-reader announcement verification remains part of the separate audit item.
- 2026-10-10: Developer reviewed Home and About at 200% browser zoom and reported both readable and usable without overlap or clipping. Source review confirms Home weather, outfit, reminders, and forecast-change content are rendered from the completed recommendation state; About contains the R10/R11 disclosures and selected-weather mascot. Together with prior visual approvals, this completes the first three Checkpoint 5 build items. Link testing and the broader accessibility/state audit remain open.
- 2026-10-10: Developer's repeat mobile Lighthouse run on the optimized production preview reported Performance 60, Accessibility 100, Best Practices 100, SEO 92, Largest Contentful Paint 10.2 s, First Contentful Paint 1.4 s, Total Blocking Time 580 ms, and Cumulative Layout Shift 0.004. Compared with the earlier preview, LCP improved from 20.8 s while Total Blocking Time and the overall performance score worsened. The single run does not isolate why; the approved smaller images remain, and the broader Checkpoint 5 audit continues.
- 2026-10-10: Developer approved the revised About mascot grounding and shorter information-card layout in the production preview. The resized logo was approved in the previous review. The full Checkpoint 5 responsive/accessibility audit remains open.
- 2026-10-10: Developer's follow-up production-preview review found the About mascot still floating and asked for smaller information-card type so both columns end sooner. The desktop cards now use tighter but readable typography and padding, the figure's minimum height and image size are reduced, and the shoes sit slightly into the grass with a subtle grounding shadow. The phone card-type override remains larger. All 88 tests and the production build pass; the Developer subsequently approved the layout.
- 2026-10-10: Developer's first production-preview review approved the resized logo but found the About mascot too close to the heading and floating above the grass. The About panel CSS now gives the figure flex space, reduces its displayed size, adds heading clearance, and places its feet near the grass boundary. All 88 tests and the production build pass; visual re-review is pending.
- 2026-10-10: Developer approved a focused payload optimization after production-preview Lighthouse reported 20.8 s Largest Contentful Paint and 3,808 KiB of transferred assets, primarily the selected outfit (1,670 KiB), loading mascot (1,327 KiB), and logo (749 KiB). Approved source PNGs remain unchanged. Transparent delivery copies were generated at 768 × 1152 for characters and 160 × 160 for the logo; the app now references those copies. The corresponding three files in the new build are roughly 964 KiB, 688 KiB, and 11 KiB. All 88 tests and the production build pass; visual review and a repeat Lighthouse run are pending.
- 2026-10-10: Developer's mobile Lighthouse screenshot of the production preview at `http://127.0.0.1:4173/` reports Performance 71, Accessibility 100, Best Practices 100, and SEO 92. The preview returned HTTP 200. Subsequent diagnostics identified a 20.8 s Largest Contentful Paint and image-heavy payload. About, status announcements, reduced motion, and 200% zoom remain unaudited.
- 2026-10-10: Developer confirmed the location dialog keeps keyboard focus inside with Tab/Shift+Tab and returns focus to the opener after Escape. Developer also confirmed the fixed phone location/date shortcuts remain usable at the bottom of Home without covering Forecast Change. Together with the prior visual review and source checks, this completes the location-interface and responsive-shortcut checklist items. All 88 tests and the production build pass again.
- 2026-10-10: Developer's Edge Lighthouse screenshot for the mobile Home load at `http://localhost:5173/` reports Performance 70, Accessibility 100, Best Practices 100, and SEO 92. This is one automated page-load audit, not verification of the open dialog, About page, keyboard behavior, status announcements, or 200% zoom. The accessibility checklist remains open pending those checks and a production-preview audit.
- 2026-10-10: Checkpoint 5 code-level accessibility pass added a persistent polite/urgent status announcer so Home rerenders do not repeat unchanged weather messages, restored a page-level Home heading when a recommendation is present, preserved Recent Location button focus across search updates, and cleared stale dialog selections on a new query. All 88 existing tests and the production build pass. Edge and Chrome headless screenshot attempts produced no capture in this Windows environment, and no axe/Lighthouse package is installed; browser-based automated and manual accessibility checks remain open.
- 2026-10-10: Checkpoint 5 phone/status slice added a fixed thumb-reachable location/date shortcut bar on Home, a loading-specific first-use message, and an alert for missing or contradictory recommendation data. Error and permission-denial messages use assertive announcements; the existing updating state keeps prior content visible but dimmed. All 88 existing tests and the production build pass. Representative phone review and accessibility checks remain open.
- 2026-10-10: Developer approved the location dialog/bottom-sheet appearance after reviewing the working slice. Keyboard/focus and screen-reader verification remain part of the Checkpoint 5 accessibility audit; the location checkbox remains open until those checks pass.
- 2026-10-10: Checkpoint 5 location-interface working slice implemented. The Home location button opens a persistent native modal dialog on laptop and a styled bottom sheet on phone; search, recent location, result selection, device location, Retry, Escape, close button, backdrop close, focus containment, and focus return are wired without replacing the dialog during search updates. Phone results select immediately; laptop results require confirmation. All 88 existing tests and the production build pass. Developer visual and keyboard review is still required before checking off the location-interface item.
- 2026-10-10: Developer selected Nunito for site-wide typography and supplied Fontsource's Nunito ZIP after package registry access failed. The variable Latin normal/italic WOFF2 files are self-hosted, the shared body font token now uses Nunito, and the SIL Open Font License is retained in the source and public build. Visual typography review remains open.
- 2026-10-10: Developer requested the About eyebrow, title, and tagline move to the left side of the heading row, with Back to Home on the right. The DOM reading order and responsive heading layout now follow that arrangement; visual re-review remains open.
- 2026-10-10: Developer screenshot showed the bottom-aligned About mascot below the first viewport. The figure now has a bounded height near the panel top, and the seven disclosure cards use shorter wording, tighter padding, and compact inline source links without dropping R10/R11 disclosures. The desktop columns still share a bottom edge; visual re-review remains open.
- 2026-10-10: Developer review showed the About mascot appearing to float above the grass in a tall panel. Rather than compressing or hiding the required disclosures, the figure is bottom-aligned within the equal-height desktop panel and the grass begins higher behind its feet. The alpha-bounds inspection helper failed under the available Windows PowerShell assembly setup, so exact optical placement awaits Developer visual review.
- 2026-10-10: Developer found the revised About disclosure column still too tall and approved rearranging the first four cards into a two-by-two grid, with the final three cards below. Copy and sources remain intact. The desktop grid now uses two equal columns above three equal bottom cards; phone keeps a single-column reading order. Visual re-review remains open.
- 2026-10-10: Developer refined the About desktop layout: the first four information cards remain full-width rows, while the last three form one compact bottom row. Phone keeps a single-column reading order. This reduces the height of the right column and follows drawing 38 more closely; visual re-review is pending.
- 2026-10-10: Developer review of the About page found the outfit mascot oversized and clipped, with the right-side information cards unlike drawing 38. The mascot panel now limits the figure size and adds internal breathing room; the seven disclosure cards form a single full-width stack in distinct muted pastels, and both desktop columns stretch to a shared bottom edge. Phone stacking remains unchanged. Visual re-review is pending.
- 2026-10-10: At the Developer's direction, the About placeholder was replaced with the reviewed Bichon mascot. It uses the selected recommendation outfit and location/date/condition from Home, falling back to the plain master when no usable recommendation exists. The About cards now carry R10/R11 methods, sources, limitations, creator and AI credits, provider credit, and privacy disclosures. The existing weather state is reused without a second fetch. All 88 tests and the production build pass; phone/laptop visual review and link/keyboard checks remain open, so the Checkpoint 5 About box is not yet marked complete.
- 2026-10-10: Developer requested the Reminders and Forecast Change headings use the same navy all-caps treatment as the Forecast label, and the weather icon sit farther from the summary's right border, closer to the center of the Water reminder below. The Home view and shared styles were adjusted; visual re-review is pending.
- 2026-10-10: Developer supplied the PUPCAST Bichon-face logo for both Home and About. The shared header now uses the approved transparent PNG instead of the temporary emoji; its source, dimensions, review, and decorative-alt guidance are recorded in the asset manifest and `spec.md`. Header visual review is pending.
- 2026-10-10: Developer requested that the laptop outfit card align its bottom edge with the right-hand Forecast Change stack, and that the outfit heading be larger with more space before the character. The Home layout now stretches both columns to the same row height and gives the outfit heading and figure more room. Visual re-review is pending.
- 2026-10-10: Developer review found that a combined rain/temperature Forecast Change kept its temperature difference in °F after switching to °C. Forecast Change now retains structured, separately rendered bullet messages and converts the temperature message independently of the leading weather event. A deterministic fixture covers rain start, rain stop, and warming together in °C; Home re-review remains open.
- 2026-10-10: Developer review of the Home slice identified low-contrast active reminders and a rainy daily forecast paired with a non-rain outfit. Active reminder cards now use a stronger blue fill and border. The Developer approved extending rain eligibility to reported weather codes and showing supported hourly rain start/stop times; the domain rules, callout, tests, and `spec.md` were updated. The app states when daily rain has no supported hourly timing and may add a meaningful temperature change as a second sentence. All 87 tests and a clean build to a new temporary output directory pass; Home visual re-review remains open.
- 2026-10-10: Checkpoint 5 Home working slice is ready for Developer review. The temporary Home placeholder was replaced with approved integrated mascot art, recommendation-state-driven weather summary, outfit guidance, exactly four reminder cards, Forecast Change, seven dates, and a °F/°C display control. The existing inline location controls remain functional until the approved modal/bottom-sheet slice. Automated tests and the production build pass; no Checkpoint 5 box is marked complete pending responsive visual and interaction review.
- 2026-10-10: Developer inspected PUPCAST in Edge DevTools. Local storage showed one `pupcast.recentLocation.v1` record containing only Austin's label and coordinates; the localhost cookie table was empty. After refreshing and selecting New York, the Network panel showed local Vite modules plus successful Open-Meteo search and forecast requests. Source review confirms the request builders use only Open-Meteo URLs and the documented query fields, with no API-key parameter, analytics, or advertising integration. Checkpoint 4 inspection is complete; the temporary Home artwork and cards are reserved for Checkpoint 5.
- 2026-10-09: Added working Home controls for US city/ZIP search, explicit device location, Retry, and seven date buttons with `aria-pressed` selection. Search results clear after selection, and stale or missing-data states remain visible. All 80 tests and the production build pass. Browser storage/network inspection remains open because local Chrome and Edge headless debugging both failed to start in this environment; the Checkpoint 5 final visual design remains separate.
- 2026-10-09: Began Checkpoint 4 with independently testable Open-Meteo geocoding/forecast, browser device-location, and one-record storage adapters. The adapter tests cover required request fields and units, US filtering, cancellation forwarding, network and malformed responses, browser permission/error codes, seven consecutive forecast dates, and blocked storage. These are not connected to the interface yet, so Checkpoint 4 boxes remain open.
- 2026-10-09: Connected the adapters through a state controller and app shell. Restore, manual/device selection methods, seven-date state, Retry, stale in-memory weather, missing apparent-temperature handling, debounced search, and out-of-order suppression pass deterministic tests. Live Austin forecast and city/ZIP requests succeeded; the forecast returned seven dates in America/Chicago and snowfall units of inches. Storage, forecast-request, and live/fixture-test tasks are checked; user-facing search and date controls, browser network/storage inspection, and the Checkpoint 4 commit remain open.

Record material plan changes and why they were made.

- 2026-10-05: Initial implementation plan drafted from the approved research, specification, and final screen drawings. The Developer selected Vite with vanilla JavaScript and Vitest, approved Agent help with the original-led AI-assisted asset process, and approved the six-checkpoint sequence for drafting.
- 2026-10-05: The Developer reviewed and approved the implementation plan; the project may proceed to implementation in working checkpoints.
- 2026-10-05: Checkpoint 1 foundation implemented with Vite 8.3.2, Vitest 5.0.3, a relative production base, and a GitHub Pages Actions workflow. Three foundation tests passed; development and preview servers returned HTTP 200; the production build completed; relative asset requests returned HTTP 200; and no common credential patterns were found in `dist/`. Laptop structure was visually compared with drawing 35, and narrow-layout rules were checked against drawing 34 after Windows headless-browser capture failures. The Developer reviewed the running Home and About shell at phone and laptop widths and approved it on 2026-10-05. The foundation was committed as `88a702a`.
- 2026-10-05: Checkpoint 2 asset production began with a 1024 × 1536 transparent canvas, shared alignment rules, and drawing 35 as the approved character-design anchor. Chelsea Lee reviewed and approved `master-bichon.png` as the production master; its method and credit were recorded in the asset manifest and specification.
- 2026-10-05: Chelsea Lee reviewed and accepted all 18 base outfits. The Very Cold set retains minor peripheral alpha and differing figure bounds after generative cleanup attempts; the Developer chose the fastest path and directed the application to normalize those canvases through consistent image sizing and positioning.
- 2026-10-05: Chelsea Lee reviewed and approved the five transparent weather-modifier overlays: rain, snow, wind, high UV, and heat. The approved overlays use the same 1024 x 1536 canvas as the master and base outfits. A repository-only asset review board was added to check individual and combined layers at responsive sizes.
- 2026-10-05: Chelsea Lee reviewed the asset board at responsive sizes and approved all 24 raster assets, seven weather icons, four reminder icons, and ten interface/loading/status icons. All rasters use 1024 x 1536 ARGB canvases with transparent corners, all SVGs parse as XML, and the manifest parses as JSON. A representative lossless PNG re-encode increased file sizes by 30-39%, so the already-compressed sources were retained.
- 2026-10-05: Checkpoint 2 production assets and their documentation were committed as `8cf9755` after a staged-file and secret-pattern review. Reference images, process scripts, and transcripts were excluded from that commit.
- 2026-10-05: Checkpoint 3 domain modules and deterministic fixtures were implemented. Node.js 22.23.2 ran 49 passing Vitest cases; the Vite production build completed; representative states for six categories, all five combined modifiers, and missing apparent-temperature data were inspected. A summary-condition mismatch was corrected so the Current/Forecast summary retains the provider condition while the mascot can use modifier-based visual treatment. Developer review and the checkpoint commit remain open.
- 2026-10-05: The Developer directed a separate umbrella overlay for mixed rain/snow states so the snow outer layer and umbrella can appear together. The asset was generated from the approved rain overlay and added to the review board; visual approval remains open.
- 2026-10-05: The Developer rejected the mixed rain/snow preview because the outerwear covered the mascot rather than appearing worn. A targeted second snow-layer generation cleared the face but copied opaque center-torso pixels from one outfit, so it could not serve as a reusable overlay. That candidate was moved to `reference/snow-v2-review.png`; the generative overlay approach is paused under the two-failure rule. Mixed-state artwork and Checkpoint 3 review remain open.
- 2026-10-05: At the Developer's direction, a code-native vector snow jacket/boot overlay and a smaller, paw-aligned umbrella were drawn and exported as transparent 1024 x 1536 PNG review candidates. Exact stacked previews over hot, mild, and cold base outfits are in `reference/redraw-v2-*-combined.png` and the asset review board. Both art candidates await Developer visual review before production replacement.
- 2026-10-05: The Developer rejected the redraws after reviewing the stacked screenshots; the jacket still looked pasted onto the Bichon rather than worn. The Developer proposed complete character renderings like the approved base outfits and excluded hot-base snow artwork. Overlay experiments remain process references only. The artwork strategy for secondary and combined modifiers must be resolved before the recommendation state and production assets can be finalized.
- 2026-10-05: An integrated cold-weather rain/snow sample was generated as a complete Bichon rendering, with the coat fitted to the body and the umbrella held in a paw, rather than compositing layers. The Developer confirmed this visual direction looks much better. The transparent review sample is `reference/integrated-cold-snow-rain-sample-v1.png`; it is not a production asset. The rule for representing secondary simultaneous conditions remains open.
- 2026-10-05: The Developer approved one complete character outfit for the primary condition and representing secondary conditions in the interface, with one modified look per eligible temperature/primary-modifier pair (29 images), while ordinary days retain three base variations. Five review candidates were created for snow/cold, rain/mild, wind/cool, high-UV/warm, and heat/hot. At the Developer's direction, the snow-only candidate was revised with fitted insulated gloves. Each candidate is a 1024 x 1536 PNG with transparent corners, stored under `reference/` and displayed in `asset-review.html` for visual review; none is a production asset yet.
- 2026-10-05: At the Developer's direction, the high-UV warm candidate was revised so the sunglasses cover the mascot's eyes instead of resting on the hat. The earlier review file remains untouched; the board now displays `reference/integrated-uv-warm-sunglasses-worn-review.png`. The revision retained the straw hat and transparent 1024 x 1536 canvas.
- 2026-10-05: The Developer approved the revised high-UV sunglasses placement and the primary-modifier priority snow, rain, wind, high UV, then heat. The six-temperature high-UV outfit family was generated for review with glasses worn over both eyes; cold-weather looks retain appropriate winter clothing instead of adding a straw sun hat. All six candidates are 1024 x 1536 with transparent corners, remain under `reference/`, and await family-level visual approval before production use.
- 2026-10-05: The Developer approved the six-look high-UV family. Non-destructive copies were promoted to `src/assets/character/weather/high-uv-*.png`; review originals remain in `reference/`. The asset manifest, specification, and review board now identify the six production images and preserve the rejected overlays as process evidence only.
- 2026-10-05: Six complete rain outfits were generated for Developer review across hot, warm, mild, cool, cold, and very cold. A targeted revision replaced ordinary sneakers in the hot and warm candidates with lightweight waterproof rubber shoes. All six are 1024 x 1536 PNGs with transparent corners, remain in `reference/`, and appear as a separate review family in `asset-review.html`; none has been promoted to production pending visual approval.
- 2026-10-05: The Developer approved the complete six-look rain family. Non-destructive copies were promoted to `src/assets/character/weather/rain-*.png`; the review originals remain in `reference/`. The board, asset manifest, and specification now identify the approved production family.
- 2026-10-05: Five complete snow outfits were generated for warm, mild, cool, cold, and very-cold categories, with no hot + snow artwork. The previously reviewed cold candidate has fitted gloves; the other four match that integrated-clothing direction while scaling insulation to the temperature category. All five review files are 1024 x 1536 transparent-corner PNGs under `reference/`, and the family awaits Developer review in `asset-review.html` before production promotion.
- 2026-10-05: At the Developer's direction, the very-cold snow neck scarf was recolored from cream to forest green to make it more noticeable against the white fur and blue parka. The revised transparent review file is `reference/integrated-snow-very-cold-green-scarf-review.png`; the earlier candidate remains untouched, and the board now displays the green-scarf version.
- 2026-10-05: The Developer approved the revised very-cold snow look, completing snow-family review. Non-destructive copies of the five reviewed looks were promoted to `src/assets/character/weather/snow-*.png`; review originals remain in `reference/`. The board, manifest, and specification now identify the approved family, with no hot + snow asset.
- 2026-10-09: The Developer confirmed that hot + snow should not be represented as a valid outfit combination. Recommendation state now marks this provider-data combination unavailable (`inconsistent-weather-data`) while retaining reported summary values. The interface must explain the inconsistency and offer Retry; an automated domain test covers the case.
- 2026-10-09: The remaining wind/cold and wind/very-cold candidates and five heat candidates (warm through very-cold) were generated with the built-in image tool as complete character illustrations. All seven are 1024 × 1536 transparent-corner PNGs under `reference/`; the review board now shows the full six-look wind and heat families. They are candidates only, pending Developer visual approval before production promotion.
- 2026-10-09: The Developer approved the full wind and heat families. All 12 reviewed images were copied into `src/assets/character/weather/` without overwriting the reference originals. The recommendation state now selects one integrated outfit by snow → rain → wind → high UV → heat priority, with no modifier overlay assets in its output; secondary conditions remain in reminders and written guidance.
- 2026-10-09: Checkpoint 3 recommendation state was finalized with image-specific descriptions for all 29 eligible integrated looks, one selected primary outfit, and secondary conditions retained in guidance and reminders for later UI rendering. Automated coverage verifies all 29 description/asset pairs and the excluded hot + snow pair.

## Saving transcripts

At the end of planning, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.

At the end of every implementation chat, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/build-YYYY-MM-DD_HHMMSS.md` using the same formatting.
