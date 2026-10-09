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
- [ ] Finalize the immutable recommendation-state function with one integrated primary-weather outfit, secondary conditions in the UI, accurate visible-outfit descriptions, and no composited modifier assets
- [x] Keep recommendation thresholds in Fahrenheit and implement Celsius as display-only conversion
- [x] Unit-test boundary values, DST/timezone handling, incomplete arrays, modifier combinations, independent variation selection, repeat visits, and changed eligibility
- [x] Run the full automated suite and inspect representative states before Developer review
- [ ] Commit the tested domain layer

#### Checkpoint 4: Live data, location, persistence, and failures

- [ ] Implement debounced US-only city/ZIP geocoding with result, no-result, service-error, cancellation, and race-condition handling
- [ ] Implement browser geolocation only after explicit activation, including locating, success, denial, unavailable, and timeout states while retaining manual search
- [ ] Implement guarded persistence of exactly one recent location label and coordinate pair; replacement removes the prior value and blocked storage leaves the session usable
- [ ] Implement the exact Open-Meteo forecast request required by R3 with location-local timezone and seven dates
- [ ] Connect restored, manual, and device locations to fetching, normalization, date selection, Retry, stale in-memory content, and missing-data handling
- [ ] Implement exactly seven consecutive local date choices and a visible/programmatic selected state
- [ ] Test live requests against Open-Meteo and test deterministic fixtures for offline, malformed, incomplete, slow, aborted, and out-of-order responses
- [ ] Inspect storage and network activity to confirm there is one location record, no API key, and no analytics, advertising, or application-cookie traffic
- [ ] Commit the working data flow

#### Checkpoint 5: Complete responsive and accessible interface

- [ ] Build the Home screen from the approved phone and laptop drawings, including weather summary, prominent mascot, recommendation, exactly four reminder cards, Forecast Change, unit control, date selector, and Open-Meteo credit
- [ ] Render all Home visual and written output only from the completed recommendation state; do not place independent weather rules in view components
- [ ] Build the About screen with the complete creator, provider, methods, sources, limitations, privacy, design/art, and AI-assistance disclosures required by R10 and R11
- [ ] Build the location interface as a laptop modal and phone bottom sheet with documented open/close controls, one recent location, result selection, keyboard operation, focus containment, and focus return
- [ ] Implement phone stacking and thumb-reachable sticky location/date shortcuts, laptop two-column composition, and the screen-specific navigation defined in R7
- [ ] Implement accessible initial loading, in-place updating, locating, denied permission, no results, service failure, stale content, and incomplete-data messages with appropriate live-region behavior
- [ ] Add semantic landmarks/headings, control names and states, meaningful or empty alternative text, logical focus order, visible focus, and non-color cues
- [ ] Compare every screen and state at representative phone and laptop widths with drawings 34-41, resolving conflicts in favor of the interpretation notes and requirements in `spec.md`
- [ ] Run automated accessibility checks and manually verify keyboard use, dialog focus, status announcements, contrast, target sizes, reduced motion, and 200% zoom
- [ ] Commit the complete locally verified interface

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

## Saving transcripts

At the end of planning, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.

At the end of every implementation chat, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/build-YYYY-MM-DD_HHMMSS.md` using the same formatting.
