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

function createFirstUsePanel(message) {
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
    createElement('p', { className: 'lede', text: message }),
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
    createElement('strong', { text: 'No location selected' }),
    createElement('span', {
      text: 'City search and device location arrive in the live-data checkpoint.',
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

function createHome(state) {
  const main = createElement('main', {
    className: 'page page--home',
    attributes: { id: 'main-content', tabindex: '-1' },
  });
  const shell = createElement('div', { className: 'page-shell' });
  shell.append(
    createFirstUsePanel(state.status.message),
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
