import { assetUrl } from './assetUrl.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function image(path, alt, className) {
  const node = element('img', className);
  node.src = assetUrl(path) ?? '';
  node.alt = alt;
  return node;
}

function button(text, dataset, value, pressed) {
  const node = element('button', '', text);
  node.type = 'button';
  node.dataset[dataset] = value;
  if (pressed !== undefined) node.setAttribute('aria-pressed', String(pressed));
  return node;
}

function dateLabel(date, options = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`));
}

function temperature(value) {
  return value?.text ?? 'Unavailable';
}

function createLocationControls(state) {
  const section = element('section', 'home-location card');
  section.setAttribute('aria-label', 'Weather location');
  section.append(element('p', 'home-location__label', 'Location'));
  const actions = element('div', 'home-location__actions');
  const choose = button(state.location?.label ?? 'Search for a US city or ZIP', 'locationDialogOpen', 'true');
  choose.setAttribute('aria-haspopup', 'dialog');
  actions.append(choose);
  if (state.location) actions.append(button('Retry weather', 'weatherAction', 'retry'));
  section.append(actions);
  return section;
}

function createDateSelector(state) {
  const section = element('section', 'date-selector card');
  section.setAttribute('aria-label', 'Choose forecast date');
  section.append(element('h2', 'section-label', 'Next seven days'));
  const choices = element('div', 'date-selector__choices');
  state.model.days.forEach(({ date }) => {
    choices.append(button(dateLabel(date), 'forecastDate', date, date === state.selectedDate));
  });
  section.append(choices);
  return section;
}

function createPhoneShortcuts(state) {
  const shortcuts = element('nav', 'phone-shortcuts');
  shortcuts.setAttribute('aria-label', 'Weather shortcuts');
  const location = button(state.location?.label ?? 'Choose location', 'locationDialogOpen', 'true');
  location.setAttribute('aria-haspopup', 'dialog');
  location.setAttribute('aria-label', `Location: ${state.location?.label ?? 'choose a US location'}`);
  shortcuts.append(location);
  if (state.selectedDate) {
    const date = button(dateLabel(state.selectedDate), 'dateShortcut', 'true');
    date.setAttribute('aria-label', `Choose forecast date; current selection ${dateLabel(state.selectedDate)}`);
    shortcuts.append(date);
  }
  return shortcuts;
}

function createSummary(recommendation) {
  const { summary } = recommendation;
  const section = element('section', 'weather-summary card');
  section.setAttribute('aria-labelledby', 'weather-summary-heading');
  section.append(element('p', 'eyebrow', summary.kind === 'current' ? 'Current weather' : 'Forecast'));
  section.append(element('h2', '', summary.condition.label));
  section.lastElementChild.id = 'weather-summary-heading';
  if (recommendation.weatherIcon) {
    section.append(image(`icons/${recommendation.weatherIcon}`, '', 'weather-summary__icon'));
  }
  section.append(element('p', 'weather-summary__date', `${dateLabel(summary.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · ${summary.location}`));
  const values = element('dl', 'weather-summary__values');
  const rows = summary.kind === 'current'
    ? [
        ['Now', summary.temperatures.current],
        ['Feels like', summary.temperatures.feelsLike],
        ['High', summary.temperatures.high],
        ['Low', summary.temperatures.low],
      ]
    : [
        ['High', summary.temperatures.high],
        ['Low', summary.temperatures.low],
        ['Daytime feels like', summary.temperatures.averageFeelsLike],
      ];
  rows.forEach(([label, value]) => {
    values.append(element('dt', '', label), element('dd', '', temperature(value)));
  });
  section.append(values);

  const units = element('div', 'unit-control');
  units.setAttribute('aria-label', 'Temperature unit');
  units.append(element('span', '', 'Units'));
  units.append(button('°F', 'temperatureUnit', 'F', summary.unit === 'F'));
  units.append(button('°C', 'temperatureUnit', 'C', summary.unit === 'C'));
  section.append(units);
  section.append(element('p', 'weather-summary__source', `Updated ${summary.updatedAt?.replace('T', ' ') ?? 'time unavailable'} · Weather data: Open-Meteo`));
  return section;
}

function createOutfit(recommendation) {
  const section = element('section', 'outfit card');
  section.setAttribute('aria-labelledby', 'outfit-heading');
  section.append(element('h2', '', recommendation.summary.kind === 'current'
    ? 'Today’s recommended fit' : 'Recommended fit for this day'));
  section.firstElementChild.id = 'outfit-heading';
  if (recommendation.available) {
    const figure = element('figure', 'outfit__figure');
    figure.append(image(recommendation.outfit.asset, recommendation.mascotAlt, 'outfit__image'));
    section.append(figure);
    section.append(element('p', 'outfit__category', `${recommendation.category.replace('-', ' ')} outfit`));
    section.append(element('p', 'outfit__copy', recommendation.recommendation));
  } else {
    section.append(image('character/master-bichon.png', '', 'outfit__image outfit__image--quiet'));
    section.append(element('p', 'outfit__copy', recommendation.reason === 'inconsistent-weather-data'
      ? 'The reported snow conflicts with the hot-weather reading, so an outfit is unavailable. Please retry.'
      : 'There is not enough apparent-temperature data to choose an outfit. Please retry.'));
  }
  return section;
}

function createReminders(recommendation) {
  const section = element('section', 'reminders card');
  section.setAttribute('aria-labelledby', 'reminders-heading');
  section.append(element('h2', 'eyebrow', 'REMINDERS'));
  section.firstElementChild.id = 'reminders-heading';
  if (recommendation.noExtrasNeeded) section.append(element('p', '', 'No weather extras needed today.'));
  const grid = element('div', 'reminders__grid');
  recommendation.reminders.forEach((reminder) => {
    const card = element('article', `reminder ${reminder.active ? 'reminder--active' : 'reminder--inactive'}`);
    card.append(image(`icons/${reminder.icon}`, '', 'reminder__icon'));
    card.append(element('h3', '', reminder.label));
    if (reminder.active) card.append(element('p', '', reminder.text));
    else card.append(element('p', '', 'Not needed for this forecast.'));
    grid.append(card);
  });
  section.append(grid);
  return section;
}

function createForecastChange(recommendation) {
  const section = element('section', 'forecast-change card');
  section.setAttribute('aria-labelledby', 'forecast-change-heading');
  section.append(element('h2', 'eyebrow', 'FORECAST CHANGE'));
  section.firstElementChild.id = 'forecast-change-heading';
  const list = element('ul', 'forecast-change__list');
  recommendation.forecastChange.items.forEach(({ text }) => {
    list.append(element('li', '', text));
  });
  section.append(list);
  return section;
}

export function renderHome(state) {
  const main = element('main', 'page page--home');
  main.id = 'main-content';
  main.tabIndex = -1;
  const shell = element('div', 'page-shell home-shell');
  main.append(shell);
  if (state.recommendation) {
    shell.append(element('h1', 'visually-hidden',
      `Weather and outfit for ${state.recommendation.summary.location}`));
  }
  const status = element('p', `home-status home-status--${state.status.kind}`, state.status.message);
  shell.append(status, createLocationControls(state));

  if (!state.recommendation) {
    const intro = element('section', 'home-intro card');
    intro.append(image('character/master-bichon.png', 'PUPCAST’s Bichon Frise mascot', 'home-intro__image'));
    const copy = element('div');
    copy.append(element('p', 'eyebrow', 'Weather-ready starts here'));
    const loading = state.status.kind === 'loading' || state.status.kind === 'locating';
    copy.append(element('h1', '', loading ? 'Checking your weather…' : 'What should you wear today?'));
    copy.append(element('p', 'lede', loading
      ? 'Your forecast and outfit will appear here shortly.'
      : 'Choose a US location to see your seven-day weather and outfit guidance.'));
    intro.append(copy);
    shell.append(intro);
    main.append(createPhoneShortcuts(state));
    return main;
  }

  const content = element('div', `home-content ${state.status.kind === 'updating' ? 'home-content--updating' : ''}`);
  const recommendation = state.recommendation;
  if (!recommendation.available) {
    const warning = element('p', 'home-warning', recommendation.reason === 'inconsistent-weather-data'
      ? 'The reported snow conflicts with hot-weather data. No outfit is shown; retry for updated conditions.'
      : 'Apparent-temperature data is incomplete. No outfit is shown; retry for updated conditions.');
    warning.setAttribute('role', 'alert');
    shell.append(warning);
  }
  const details = element('div', 'home-content__details');
  details.append(createSummary(recommendation), createReminders(recommendation), createForecastChange(recommendation));
  content.append(createOutfit(recommendation), details);
  shell.append(createDateSelector(state), content);
  main.append(createPhoneShortcuts(state));
  return main;
}
