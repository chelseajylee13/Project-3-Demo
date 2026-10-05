# Research

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Research your context of use, references, weather guidance, technical options, and choices that will guide the specification.

## Instructions for the Developer

Judge sources and recommendations, make the consequential decisions, and keep this file current as the work develops.

To begin, open the project repository in a fresh chat and enter:

`Read ./research.md and help me begin Project 3 research.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, and this file. Ask one focused question at a time. Help investigate and compare options without deciding for the Developer. Verify sources directly and keep this file concise.

## Context of use

As the User, describe when and where you would use the app and what you need from it. Record important circumstances, assumptions, and limitations.

The User checks the app at home before commuting to campus by car or public transit. They spend roughly six hours on campus, frequently walking outdoors between classes. They need an outfit recommendation that remains comfortable and practical as weather conditions change throughout the day. In particular, the User wants to avoid dressing too hot or cold, remember an umbrella and sunscreen when needed, and choose water-resistant shoes when rain is expected. Recommendations should suit US college students while supporting the Client's playful clothing-brand campaign.

## User story

Write at least one user story grounded in your context of use:

> As a [type of user], I want to [need or goal], so that [reason or outcome].

Focus on the need rather than prescribing an interface or feature.

> As a college student preparing for a day on campus, I want an outfit recommendation based on the day's changing weather, so that I can stay comfortable and remember protective items such as an umbrella, sunscreen, and water-resistant shoes.

## References

Collect 5–10 reference images from relevant products and interfaces. Save each image in `reference/`, identify its source, and record a brief observation about what is useful, ineffective, or relevant to this project. Reference images are examples only; do not use them in the app.

1. **Weather Fit—wardrobe screen.** The card grid makes outfit variations easy to scan and organizes clothing by category. However, this setup view does not explain why an item suits the forecast. [Source](https://weatherfit.com/)
2. **Weather Fit—day screen.** The character is the focal point, while location, conditions, and temperature remain visible above it. The scenic background adds personality, but reminders and recommendation reasoning are not immediately visible. [Source](https://weatherfit.com/)
3. **Weather Fit—night screen.** The consistent layout changes convincingly with time and conditions. The detailed scenery could compete with important weather information or reduce contrast. [Source](https://weatherfit.com/)
4. **Reima—app and product overview.** This connects weather guidance, layered outfit recommendations, and clothing products effectively. Its promotional composition is less useful as a model for the app's everyday main screen. [Source](https://scandinavianoutdooraward.com/reima-reima-weather-app/)
5. **Reima—weather characters.** Distinct clothing makes temperature differences understandable at a glance, while the character supports a playful brand identity. The child-focused style would need adapting for college users. [Source](https://scandinavianoutdooraward.com/reima-reima-weather-app/)
6. **Weather Outfit.** Weather data, outfit categories, and an hourly forecast fit on one screen. The interface is dense, uses small text and pale colors, and does not make a character the primary focus. [Source](https://play.google.com/store/apps/details?id=com.byteexperts.weatheroutfits)
7. **Weatherbunny—rain.** The umbrella and layered clothing communicate rain preparation immediately. The hierarchy and whitespace are strong, but written reasoning and separate reminders are absent. [Source](https://apps.apple.com/us/app/weatherbunny-outfit-helper/id6761869760)
8. **Weatherbunny—extreme cold.** The oversized insulated outfit makes the recommendation state unmistakable and demonstrates an edge case. Most garment details disappear inside the coat, limiting visible variation. [Source](https://apps.apple.com/us/app/weatherbunny-outfit-helper/id6761869760)
9. **Weatherbunny—heat.** Minimal clothing and the warm background tint communicate hot conditions simply. The faint temperature graph and secondary text may be difficult to read, and color should not be the only condition cue. [Source](https://apps.apple.com/us/app/weatherbunny-outfit-helper/id6761869760)

## Weather and technical evidence

Record each useful source, what it supports, and important limitations. Research the weather variables, apparel guidance, reminders, accessibility, privacy, artwork, weather providers, and technical options needed for informed decisions.

- **Open-Meteo Forecast API:** Provides hourly and daily forecasts, including apparent temperature, precipitation probability, UV index, humidity, wind, and weather codes. It supports forecasts up to 16 days. This covers the main inputs needed for outfit categories and weather reminders. [Source](https://open-meteo.com/en/docs)
- **Open-Meteo Geocoding API:** Accepts city or postal-code searches and can restrict results to the United States. This supports manual location entry, while the browser Geolocation API can supply coordinates for device location. [Source](https://open-meteo.com/en/docs/geocoding-api)
- **Open-Meteo pricing and licensing:** The free service can be used for evaluation and prototyping without exposing an API key, which suits a static GitHub Pages deployment. Attribution is required, the free service has usage limits and no reserved-server reliability, and a commercial release would require a licensing review. [Source](https://open-meteo.com/en/pricing)
- **Provider alternatives:** The National Weather Service offers free US forecast data but requires a more complex chain of location and grid requests and does not provide the complete UV-oriented dataset as conveniently. WeatherAPI offers forecast and location data but requires an API key, which could not be kept secret in a static browser app without adding a backend. [NWS source](https://www.weather.gov/documentation/services-web-api) and [WeatherAPI source](https://www.weatherapi.com/docs/)
- **UV protection:** The US EPA recommends sun protection beginning at UV index 3. Use the selected day's maximum UV index to trigger a sunscreen reminder. [Source](https://www.epa.gov/sunsafety/uv-index-scale-0)
- **Precipitation:** The National Weather Service describes a 30–50% probability of measurable precipitation as a "chance." Use a maximum hourly precipitation probability of at least 30% to trigger umbrella and water-resistant-shoe reminders. This threshold is a prototype product rule rather than a guarantee that rain will occur. [Source](https://www.weather.gov/ppg/forecast_terms)
- **Wind:** National Weather Service forecast terminology begins describing sustained wind as "breezy" at 15–25 mph. Use a selected day's maximum hourly sustained wind of at least 15 mph to add wind-resistant outerwear guidance. Treat the threshold as a prototype rule to evaluate during peer testing. [Source](https://www.weather.gov/ppg/forecast_terms)
- **Heat:** National Weather Service heat guidance begins its caution range at a heat index of 80°F, while CDC guidance recommends hydration and loose, lightweight, light-colored clothing during extreme heat. Use apparent temperature beginning at 80°F for a hydration reminder and stronger guidance as it rises. [NWS source](https://www.weather.gov/ama/heatindex) and [CDC source](https://www.cdc.gov/climate-health/php/resources/protect-yourself-from-the-dangers-of-extreme-heat.html)
- **Cold and wet conditions:** OSHA recommends loose layers, a wind- and rain-resistant outer layer, and insulated waterproof footwear for cold environments. Cold recommendations should emphasize layers, while precipitation modifies the footwear and outerwear guidance. [Source](https://www.osha.gov/emergency-preparedness/guides/cold-stress)
- **Snow:** Open-Meteo provides hourly snowfall amounts and snow-related WMO weather codes. Any reported snowfall during the 8:00 AM–8:00 PM window triggers the snow state, insulated layers, and waterproof-footwear guidance. This is apparel guidance, not a travel-safety determination. [Source](https://open-meteo.com/en/docs)
- **Recommendation limitations:** Exact comfort thresholds vary by person, activity, exposure, and clothing. The temperature bands are prototype heuristics based on apparent temperature and should be evaluated during peer testing; the app should present comfort guidance rather than medical or severe-weather safety advice.
- **Accessibility:** Target WCAG 2.2 AA. Provide at least 4.5:1 contrast for normal text, do not use color alone to identify weather or recommendation states, preserve keyboard operation and visible focus, expose loading and error updates as status messages, and provide text equivalents for meaningful character and weather artwork. Interactive targets must be at least 24 by 24 CSS pixels; use larger controls where practical for one-handed phone use. [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) and [target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- **Location permission:** Browser device location requires HTTPS and explicit User permission. Request it only after the User activates a location control, explain why it is needed, and keep manual location search available when permission is denied or unavailable. [Source](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)
- **Local storage:** Browser `localStorage` persists across sessions but may be unavailable when storage is blocked. Store only the most recent location and fall back safely when persistence fails. [Source](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- **Static hosting:** GitHub Pages publishes static HTML, CSS, and JavaScript and supports the HTTPS context required by device location. GitHub states that Pages logs visitor IP addresses for security purposes; the information screen should not imply that using the deployed app produces no external network records. [Source](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- **Provider terms and privacy:** The brief defines a prototype demonstration conducted by the Developer and evaluated with peers, with no real advertising, sales, subscriptions, or live Client operation specified. Open-Meteo's free API permits noncommercial prototype use, but its terms classify integration into real promotional activities as commercial use. Its free API may retain server logs containing IP addresses and requested coordinates for up to 90 days. If an actual brand adopts the app for a live campaign, the provider licence must be reviewed and changed before launch. [Source](https://open-meteo.com/en/terms)

## Decisions

Record the selected weather provider, forecast range, recommendation categories and rules, screen structure, visual direction, artwork approach (original, AI-generated, or appropriately licensed), deployment method, and one additional feature justified by the research. Briefly explain important trade-offs.

- **Weather provider:** Use Open-Meteo for the prototype. It supplies the required forecast variables and US location search without putting a secret API key in the browser. Credit Open-Meteo on the information screen. Revisit its licence and service plan before any commercial release.
- **Forecast range:** Show today plus the next six days. Seven days supports short-term planning without crowding the date selector or implying that distant forecasts are equally certain.
- **Recommendation categories:** Use six starting apparent-temperature bands: hot at 85°F or above, warm at 70–84°F, mild at 55–69°F, cool at 40–54°F, cold at 20–39°F, and very cold below 20°F. Rain, snow, high UV, and wind modify the recommendation and reminders instead of multiplying the number of base categories. The band boundaries remain subject to peer testing.
- **Daily category calculation:** Select the base category using the average of the hourly apparent temperatures from 8:00 AM through 8:00 PM in the chosen location's local time. Keep one stable base category for each selected date; use the forecast-change callout and removable-layer wording to communicate meaningful variation within the day.
- **Weather modifiers and reminders:** At UV index 3 or above, add sunscreen guidance. At a maximum hourly precipitation probability of 30% or above, add umbrella and water-resistant-shoe guidance. Any reported snowfall or snow-related weather code from 8:00 AM through 8:00 PM adds the snow state, insulated layers, and waterproof footwear. At apparent temperature 80°F or above, add hydration guidance. At a maximum hourly sustained wind of 15 mph or above, add wind-resistant outerwear guidance. These modifiers update the mascot outfit where applicable, the weather icon, the written recommendation, and reminders from the same recommendation state.
- **Artwork estimate:** Plan for one base character, 18 outfit variations (three for each of six categories), seven weather icons (clear, partly cloudy, overcast, fog, rain, snow, and thunderstorm), and four reminder icons (umbrella, sunscreen, hydration, and water-resistant shoes): approximately 30 assets before general interface icons.
- **Artwork approach:** Use an original-led hybrid process. The Developer's drawing establishes the character, proportions, and visual direction; AI may assist with controlled outfit or pose variations derived from that original. Retain the original drawing, review generated assets for consistency and unwanted artifacts, and disclose AI assistance in the information screen's art credits.
- **Visual direction:** Center the interface on an original upright, anthropomorphic Bichon Frise mascot with a simple, recognizable fluffy silhouette and clearly readable outfit changes. Use a polished, professional illustration style that remains cute without feeling child-oriented. Preserve enough visible torso and leg area for layers and footwear to remain understandable. Weatherbunny is a reference for character hierarchy and glanceable clothing, not a design to copy.
- **Additional feature:** Include a forecast-change callout that highlights a meaningful shift later in the selected day. Trigger it when apparent temperature changes by at least 10°F or precipitation probability crosses 30%; prioritize a rain or snow callout when both conditions occur. This supports the User's six-hour campus day by helping them dress for conditions beyond the moment they leave home, without requiring schedule setup. Treat these thresholds as starting rules to evaluate during peer testing.
- **Screen structure:** Use two screens. The main recommendation screen contains location and date controls, a weather summary, the Bichon mascot, written outfit guidance, reminders, and the forecast-change callout. The information screen identifies the creator, weather source, recommendation methods and limitations, privacy practices, and art or AI credits. Manual location search opens as a dialog rather than a separate screen. On phones, content stacks vertically with primary controls within thumb reach; on laptops, the mascot and recommendation details use a two-column layout.
- **Deployment:** Publish the static app with GitHub Pages and enforce HTTPS. This supports device geolocation without adding a backend and matches the selected keyless Open-Meteo integration.
- **Privacy practices:** Do not add accounts, analytics, advertising, or application cookies. Request device location only after the User activates the control, send the selected coordinates to Open-Meteo only to retrieve location-specific weather, and store only the most recent location label and coordinates in browser `localStorage`. Replacing the location replaces the stored value. The information screen must explain local storage and disclose the external network logs described by GitHub Pages and Open-Meteo. This privacy approach applies to the noncommercial prototype; reassess it before any live Client use.

Once the recommendation categories are chosen, estimate the art needed: the character, three outfit variations per category, weather icons, and reminder icons. Use that estimate to choose the artwork approach.

## Revisions

Record new evidence or changed decisions and explain why they changed.

- Open-Meteo was initially selected for its keyless prototype API. A later review of its terms clarified that the free service is appropriate only for this noncommercial prototype; a live Client promotional use would require a commercial licence review. The privacy decision was also expanded to disclose Open-Meteo's temporary API logs and GitHub Pages' security logging.

## Approval

The Developer reviews the sources and decisions, corrects this file, and explicitly approves it before specification begins.

Approved by the Developer on 2026-10-04. Research is complete and may proceed to specification.

## Saving the transcript

After the Developer approves the research, ask them to enter `save transcript`. When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.
