function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function action(label, className) {
  const button = node('button', className, label);
  button.type = 'button';
  return button;
}

export function createLocationDialog(weather, getState) {
  const dialog = node('dialog', 'location-dialog');
  dialog.setAttribute('aria-labelledby', 'location-dialog-heading');
  const panel = node('div', 'location-dialog__panel');
  const header = node('div', 'location-dialog__header');
  const heading = node('h2', '', 'Choose a location');
  heading.id = 'location-dialog-heading';
  const closeButton = action('Close location search', 'location-dialog__close');
  closeButton.setAttribute('aria-label', 'Close location search');
  closeButton.textContent = '×';
  header.append(heading, closeButton);
  const description = node('p', 'location-dialog__description',
    'Search for a US city or ZIP code to get weather and outfit recommendations.');

  const form = node('form', 'location-dialog__search');
  const label = node('label', '', 'US city or ZIP code');
  label.htmlFor = 'location-dialog-search';
  const input = node('input');
  input.id = 'location-dialog-search';
  input.type = 'search';
  input.autocomplete = 'off';
  input.placeholder = 'Austin, TX or 78701';
  input.setAttribute('aria-controls', 'location-dialog-results');
  const searchButton = node('button', '', 'Search');
  searchButton.type = 'submit';
  const locateButton = action('Use my location', 'location-dialog__locate');
  form.append(label, input, searchButton, locateButton);

  const note = node('p', 'location-dialog__note', 'U.S. locations only. Your most recent location appears below.');
  const recent = node('div', 'location-dialog__recent');
  const resultHeading = node('h3', '', 'Search results');
  const message = node('p', 'location-dialog__message');
  message.setAttribute('role', 'status');
  const results = node('div', 'location-dialog__results');
  results.id = 'location-dialog-results';
  const footer = node('div', 'location-dialog__footer');
  const selectedLabel = node('p', 'location-dialog__selected', 'Select a location to continue.');
  const cancelButton = action('Cancel', 'location-dialog__cancel');
  const confirmButton = action('Use this location', 'location-dialog__confirm');
  confirmButton.disabled = true;
  footer.append(selectedLabel, cancelButton, confirmButton);
  panel.append(header, description, form, note, recent, resultHeading, message, results, footer);
  dialog.append(panel);

  let opener = null;
  let selected = null;
  let recentLabel = null;

  function clearSelection() {
    selected = null;
    selectedLabel.textContent = 'Select a location to continue.';
    confirmButton.disabled = true;
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  function choose(location) {
    selected = location;
    selectedLabel.textContent = `Selected: ${location.label}`;
    confirmButton.disabled = false;
    results.querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.textContent === location.label));
    });
    if (window.matchMedia('(max-width: 38rem)').matches) {
      close();
      void weather.selectLocation(location);
    }
  }

  function update(state) {
    if (document.activeElement !== input) input.value = state.search.query;
    locateButton.disabled = state.status.kind === 'locating';
    locateButton.textContent = locateButton.disabled ? 'Locating…' : 'Use my location';
    const nextRecentLabel = state.location?.label ?? null;
    if (nextRecentLabel !== recentLabel) {
      recentLabel = nextRecentLabel;
      recent.replaceChildren();
      if (state.location) {
        recent.append(node('h3', '', 'Recent location'));
        const recentButton = action(state.location.label, 'location-dialog__result');
        recentButton.addEventListener('click', () => choose(state.location));
        recent.append(recentButton);
      }
    }
    message.textContent = state.search.message;
    if (state.search.kind === 'no-results') {
      message.textContent = 'No US locations found. Try a different city or ZIP code.';
    }
    results.replaceChildren();
    state.search.results.forEach((location) => {
      const result = action(location.label, 'location-dialog__result');
      result.setAttribute('aria-pressed', String(selected?.label === location.label));
      result.addEventListener('click', () => choose(location));
      results.append(result);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearSelection();
    void weather.search(input.value);
  });
  input.addEventListener('input', () => {
    clearSelection();
    void weather.search(input.value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      const first = results.querySelector('button');
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  results.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    const buttons = [...results.querySelectorAll('button')];
    const current = buttons.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
    if (buttons[next]) {
      event.preventDefault();
      buttons[next].focus();
    } else if (event.key === 'ArrowUp' && current === 0) {
      event.preventDefault();
      input.focus();
    }
  });
  locateButton.addEventListener('click', () => {
    close();
    void weather.locate();
  });
  confirmButton.addEventListener('click', () => {
    if (!selected) return;
    close();
    void weather.selectLocation(selected);
  });
  closeButton.addEventListener('click', close);
  cancelButton.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus();
    else document.querySelector('[data-location-dialog-open]')?.focus();
  });

  return {
    element: dialog,
    update,
    open(button) {
      opener = button;
      clearSelection();
      void weather.search('');
      update(getState());
      dialog.showModal();
      input.focus();
    },
    close,
  };
}
