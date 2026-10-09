import { SCREENS } from '../domain/screens.js';

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.className) element.className = options.className;
  if (options.text) element.textContent = options.text;
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }

  return element;
}

function createBrand() {
  const brand = createElement('div', { className: 'brand' });
  const mark = createElement('span', {
    className: 'brand__mark',
    text: '🐶',
    attributes: { 'aria-hidden': 'true' },
  });
  const copy = createElement('div');
  copy.append(
    createElement('p', { className: 'brand__name', text: 'PUPCAST' }),
    createElement('p', {
      className: 'brand__tagline',
      text: 'Your weather-ready outfit buddy.',
    }),
  );
  brand.append(mark, copy);
  return brand;
}

function createNavigation(activeScreen) {
  const nav = createElement('nav', {
    className: 'primary-nav',
    attributes: { 'aria-label': 'Primary navigation' },
  });

  [
    [SCREENS.HOME, 'Home'],
    [SCREENS.ABOUT, 'About'],
  ].forEach(([screen, label]) => {
    const button = createElement('button', {
      className: 'nav-button',
      text: label,
      attributes: { type: 'button', 'data-screen': screen },
    });

    if (screen === activeScreen) {
      button.setAttribute('aria-current', 'page');
    }

    nav.append(button);
  });

  return nav;
}

function createHeader(activeScreen) {
  const header = createElement('header', { className: 'site-header' });
  const inner = createElement('div', { className: 'site-header__inner' });
  inner.append(createBrand(), createNavigation(activeScreen));
  header.append(inner);
  return header;
}

function createMascotPlaceholder() {
  const figure = createElement('figure', { className: 'mascot-placeholder' });
  const illustration = createElement('div', {
    className: 'mascot-placeholder__illustration',
    attributes: { role: 'img', 'aria-label': 'PUPCAST mascot artwork placeholder' },
  });
  illustration.append(
    createElement('span', {
      className: 'mascot-placeholder__face',
      text: '🐶',
      attributes: { 'aria-hidden': 'true' },
    }),
    createElement('span', {
      className: 'mascot-placeholder__shirt',
      text: 'PUPCAST',
      attributes: { 'aria-hidden': 'true' },
    }),
  );
  figure.append(illustration);
  return figure;
}

function createFirstUsePanel(state) {
  const section = createElement('section', {
    className: 'first-use-panel',
    attributes: { 'aria-labelledby': 'first-use-heading' },
  });
  const copy = createElement('div', { className: 'first-use-panel__copy' });
  copy.append(
    createElement('p', { className: 'eyebrow', text: 'Weather-ready starts here' }),
    createElement('h1', {
      text: 'What should you wear today?',
      attributes: { id: 'first-use-heading' },
    }),
    createElement('p', { className: 'lede', text: state.status.message }),
  );

  const prompt = createElement('div', {
    className: 'location-prompt',
    attributes: { role: 'status', 'aria-live': 'polite' },
  });
  prompt.append(
    createElement('span', {
      className: 'location-prompt__icon',
      text: '⌖',
      attributes: { 'aria-hidden': 'true' },
    }),
    createElement('div', { className: 'location-prompt__text' }),
  );
  prompt.lastElementChild.append(
    createElement('strong', { text: state.location?.label ?? 'No location selected' }),
    createElement('span', {
      text: state.status.message,
    }),
  );
  copy.append(prompt);
  section.append(createMascotPlaceholder(), copy);
  return section;
}

function createPreviewCard(title, text, modifier = '') {
  const article = createElement('article', {
    className: `preview-card ${modifier}`.trim(),
  });
  article.append(
    createElement('h2', { text: title }),
    createElement('p', { text }),
  );
  return article;
}

function createWeatherControls(state) {
  const section = createElement('section', {
    className: 'weather-controls preview-card',
    attributes: { 'aria-labelledby': 'weather-controls-heading' },
  });
  section.append(createElement('h2', { text: 'Choose your weather location', attributes: { id: 'weather-controls-heading' } }));

  const searchLabel = createElement('label', { text: 'US city or ZIP code', attributes: { for: 'location-search' } });
  const searchInput = createElement('input', {
    attributes: {
      id: 'location-search', type: 'search', autocomplete: 'off',
      placeholder: 'Austin, TX or 78701', value: state.search.query,
      'aria-controls': 'location-results',
    },
  });
  section.append(searchLabel, searchInput);

  const actions = createElement('div', { className: 'weather-controls__actions' });
  actions.append(createElement('button', {
    text: state.status.kind === 'locating' ? 'Locating…' : 'Use my location',
    attributes: { type: 'button', 'data-weather-action': 'locate',
      ...(state.status.kind === 'locating' ? { disabled: '' } : {}) },
  }));
  if (state.location) {
    actions.append(createElement('button', {
      text: 'Retry weather',
      attributes: { type: 'button', 'data-weather-action': 'retry' },
    }));
  }
  section.append(actions);

  const results = createElement('div', {
    className: 'weather-controls__results',
    attributes: { id: 'location-results', 'aria-label': 'Location search results' },
  });
  if (state.search.message) {
    results.append(createElement('p', {
      text: state.search.message,
      attributes: { role: 'status', 'aria-live': 'polite' },
    }));
  }
  state.search.results.forEach((location, index) => {
    results.append(createElement('button', {
      text: location.label,
      attributes: { type: 'button', 'data-location-index': String(index) },
    }));
  });
  section.append(results);

  const status = createElement('p', {
    className: 'weather-controls__status',
    text: state.status.message,
    attributes: { role: 'status', 'aria-live': 'polite' },
  });
  section.append(status);

  if (state.model) {
    const forecast = createElement('div', { className: 'weather-controls__forecast' });
    const modelLabel = state.model.location.label;
    forecast.append(createElement('h3', { text: `Seven-day forecast for ${modelLabel}` }));
    if (state.status.kind === 'stale' || state.location?.label !== modelLabel) {
      forecast.append(createElement('p', { text: 'Showing the last successful forecast.' }));
    }
    const dates = createElement('div', {
      className: 'weather-controls__dates',
      attributes: { 'aria-label': 'Forecast dates' },
    });
    state.model.days.forEach((day) => {
      dates.append(createElement('button', {
        text: new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
          .format(new Date(`${day.date}T12:00:00Z`)),
        attributes: {
          type: 'button', 'data-forecast-date': day.date,
          'aria-pressed': String(day.date === state.selectedDate),
        },
      }));
    });
    forecast.append(dates);
    forecast.append(createElement('p', {
      text: state.recommendation?.available
        ? `Selected ${state.selectedDate}: ${state.recommendation.category} outfit guidance is ready.`
        : `Selected ${state.selectedDate}: outfit guidance is unavailable because required weather data is missing.`,
    }));
    section.append(forecast);
  }
  return section;
}

function createHome(state) {
  const main = createElement('main', {
    className: 'page page--home',
    attributes: { id: 'main-content', tabindex: '-1' },
  });
  const shell = createElement('div', { className: 'page-shell' });
  shell.append(
    createFirstUsePanel(state),
    createWeatherControls(state),
    createElement('section', {
      className: 'preview-grid',
      attributes: {
        'aria-label': 'Recommendation sections available after choosing a location',
      },
    }),
  );
  const previewGrid = shell.lastElementChild;
  previewGrid.append(
    createPreviewCard('Weather summary', 'Current conditions and a seven-day selector will appear here.'),
    createPreviewCard('Outfit recommendation', 'One shared recommendation state will coordinate the outfit and written guidance.'),
    createPreviewCard('Reminders', 'Umbrella, water-resistant shoes, sunscreen, and water will stay visible here.'),
    createPreviewCard('Forecast change', 'A meaningful shift during the campus day will be called out here.'),
  );
  main.append(shell);
  return main;
}

function createAbout() {
  const main = createElement('main', {
    className: 'page page--about',
    attributes: { id: 'main-content', tabindex: '-1' },
  });
  const shell = createElement('div', { className: 'page-shell' });
  const heading = createElement('section', { className: 'about-heading' });
  const back = createElement('button', {
    className: 'back-button',
    text: '← Back to Home',
    attributes: { type: 'button', 'data-screen': SCREENS.HOME },
  });
  heading.append(
    back,
    createElement('div', { className: 'about-heading__copy' }),
  );
  heading.lastElementChild.append(
    createElement('p', { className: 'eyebrow', text: 'Meet your outfit buddy' }),
    createElement('h1', { text: 'About PUPCAST' }),
    createElement('p', {
      className: 'lede',
      text: 'PUPCAST helps you dress for yourself with practical, weather-based outfit guidance.',
    }),
  );

  const layout = createElement('div', { className: 'about-layout' });
  const artPanel = createElement('section', {
    className: 'about-art',
    attributes: { 'aria-label': 'PUPCAST mascot preview' },
  });
  artPanel.append(
    createElement('p', { text: 'What is your outfit going to be today?' }),
    createMascotPlaceholder(),
  );

  const topics = createElement('div', { className: 'about-topics' });
  [
    ['Created by', 'Chelsea Lee created the PUPCAST concept and visual direction.'],
    ['Weather data', 'Open-Meteo will provide current conditions and forecasts.'],
    ['How recommendations work', 'Temperature and weather conditions will drive practical outfit guidance.'],
    ['Limitations', 'Recommendations are general comfort guidance, not safety or medical advice.'],
    ['Privacy', 'The finished app will keep only one recent location in this browser.'],
    ['Design, art, and AI assistance', 'Complete production credits will be recorded as assets are reviewed.'],
  ].forEach(([title, text]) => topics.append(createPreviewCard(title, text)));

  layout.append(artPanel, topics);
  shell.append(heading, layout);
  main.append(shell);
  return main;
}

function createFooter() {
  const footer = createElement('footer', { className: 'site-footer' });
  const copy = createElement('p');
  copy.append('Weather data will be provided by ');
  const link = createElement('a', {
    text: 'Open-Meteo',
    attributes: { href: 'https://open-meteo.com/', rel: 'noreferrer' },
  });
  copy.append(link, '.');
  footer.append(copy);
  return footer;
}

export function renderApp(state) {
  const fragment = document.createDocumentFragment();
  fragment.append(
    createHeader(state.screen),
    state.screen === SCREENS.ABOUT ? createAbout() : createHome(state),
    createFooter(),
  );
  return fragment;
}
