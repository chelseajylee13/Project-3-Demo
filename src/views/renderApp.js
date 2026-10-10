import { SCREENS } from '../domain/screens.js';
import logoUrl from '../assets/delivery/brand/pupcast-logo.png';
import { assetUrl } from './assetUrl.js';
import { renderHome } from './renderHome.js';

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
    attributes: { 'aria-hidden': 'true' },
  });
  mark.append(createElement('img', {
    className: 'brand__logo',
    attributes: { src: logoUrl, alt: '', width: '160', height: '160' },
  }));
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

function createAboutCard(title, paragraphs, links = []) {
  const article = createElement('article', { className: 'about-card' });
  article.append(createElement('h2', { text: title }));
  paragraphs.forEach((copy) => article.append(createElement('p', { text: copy })));
  links.forEach(([label, href]) => article.append(createElement('a', {
    text: label,
    attributes: { href, rel: 'noreferrer' },
  })));
  return article;
}

function createAbout(state) {
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
    createElement('div', { className: 'about-heading__copy' }),
    back,
  );
  heading.firstElementChild.append(
    createElement('p', { className: 'eyebrow', text: 'Meet your outfit buddy' }),
    createElement('h1', { text: 'About PUPCAST' }),
    createElement('p', {
      className: 'lede',
      text: 'A little Bichon, a little forecast, and practical ideas for what to wear.',
    }),
  );

  const layout = createElement('div', { className: 'about-layout' });
  const artPanel = createElement('section', {
    className: 'about-art',
    attributes: { 'aria-label': 'Your selected weather and PUPCAST mascot' },
  });
  artPanel.append(createElement('p', {
    className: 'about-art__eyebrow', text: 'Your weather-ready buddy',
  }));
  const figure = createElement('figure', { className: 'about-art__figure' });
  figure.append(createElement('img', {
    className: 'about-art__mascot',
    attributes: {
      src: assetUrl(state.recommendation?.available
        ? state.recommendation.outfit.asset : 'character/master-bichon.png'),
      alt: state.recommendation?.available
        ? state.recommendation.mascotAlt : 'PUPCAST Bichon Frise mascot',
      width: '768', height: '1152',
    },
  }));
  artPanel.append(figure);
  let selectedWeather = 'Choose a location on Home to see your weather-ready look here.';
  if (state.recommendation) {
    const { summary } = state.recommendation;
    const date = new Intl.DateTimeFormat('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(`${summary.date}T12:00:00Z`));
    selectedWeather = `${summary.location} · ${date} · ${summary.condition.label}`;
  }
  artPanel.append(createElement('p', {
    className: 'about-art__weather', text: selectedWeather,
  }));

  const topics = createElement('div', { className: 'about-topics' });
  topics.append(
    createAboutCard('Created by', ['Chelsea Lee created PUPCAST’s concept, name, visual direction, main laptop layout, and original Bichon design.']),
    createAboutCard('Weather data', ['Open-Meteo supplies current weather and seven-day forecasts. This look follows your Home location and date.'], [['Open-Meteo ↗', 'https://open-meteo.com/']]),
    createAboutCard('How recommendations work', ['Six outfit categories use daytime apparent temperature. Snow, rain, wind, high UV, or heat can change the complete outfit; other active conditions appear in written guidance and reminders. These thresholds are comfort heuristics.']),
    createAboutCard('Guidance sources', ['Our weather-guidance thresholds draw on:'], [
      ['EPA · UV ↗', 'https://www.epa.gov/sunsafety/uv-index-scale-0'],
      ['NWS · rain and wind ↗', 'https://www.weather.gov/ppg/forecast_terms'],
      ['CDC · heat ↗', 'https://www.cdc.gov/climate-health/php/resources/protect-yourself-from-the-dangers-of-extreme-heat.html'],
      ['OSHA · cold ↗', 'https://www.osha.gov/winter-weather/cold-stress'],
    ]),
    createAboutCard('Limitations', ['Forecasts and comfort vary. This is not medical, emergency, or severe-weather safety advice; check official alerts and use your own judgment.']),
    createAboutCard('Privacy', ['No accounts, analytics, ads, or app cookies. Only the last location label and coordinates are stored in this browser, replacing the previous one; the session works if storage is blocked. Device location is requested only when you choose it. Coordinates go to Open-Meteo for weather; it may log API requests, and GitHub Pages logs visitor IP addresses for security.']),
    createAboutCard('Design, art, and AI assistance', ['Chelsea Lee directs and reviews the artwork; AI-assisted variations follow her original Bichon design. ChatGPT helped with responsive and state-design references based on her visual. Codex by OpenAI assisted with research, specification, planning, and code. Neither Open-Meteo nor OpenAI endorses PUPCAST.']),
  );

  layout.append(artPanel, topics);
  shell.append(heading, layout);
  main.append(shell);
  return main;
}

function createFooter() {
  const footer = createElement('footer', { className: 'site-footer' });
  const copy = createElement('p');
  copy.append('Weather data provided by ');
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
    state.screen === SCREENS.ABOUT ? createAbout(state) : renderHome(state),
    createFooter(),
  );
  return fragment;
}
