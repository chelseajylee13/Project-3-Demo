export const OUTFIT_VARIATIONS = Object.freeze({
  hot: Object.freeze([
    'a sleeveless top, athletic shorts, and sneakers',
    'a lightweight tank top, loose shorts, and sneakers',
    'a lightweight short-sleeve shirt, airy pants, and sneakers',
  ]),
  warm: Object.freeze([
    'a T-shirt, shorts, and sneakers',
    'a T-shirt, lightweight jeans, and sneakers',
    'a casual polo, lightweight pants, and sneakers',
  ]),
  mild: Object.freeze([
    'a hoodie, jeans, and sneakers',
    'a crewneck sweatshirt, casual pants, and sneakers',
    'a light denim jacket over a T-shirt, jeans, and sneakers',
  ]),
  cool: Object.freeze([
    'a sweater, jeans, and closed-toe shoes',
    'a hoodie under a light jacket, pants, and sneakers',
    'a long-sleeve shirt with an overshirt, pants, and closed-toe shoes',
  ]),
  cold: Object.freeze([
    'a puffer jacket over a sweater, pants, and boots',
    'a wool-style coat over a hoodie, jeans, and boots',
    'an insulated jacket, knit top, pants, and boots',
  ]),
  'very-cold': Object.freeze([
    'a parka, thermal layers, insulated pants, winter boots, a hat, gloves, and a neck warmer',
    'a long puffer, sweater, thick pants, winter boots, a hat, gloves, and a scarf',
    'a heavy jacket over a hoodie, fleece-lined pants, winter boots, a hat, gloves, and a scarf',
  ]),
});

export const PRIMARY_OUTFIT_DESCRIPTIONS = Object.freeze({
  snow: Object.freeze({
    warm: 'a blue snow jacket, dark pants, gloves, and waterproof boots',
    mild: 'a light-blue snow jacket over a hoodie, jeans, gloves, and waterproof boots',
    cool: 'a yellow snow jacket over a hoodie, warm pants, gloves, and waterproof boots',
    cold: 'a blue insulated parka, dark pants, gloves, and waterproof boots',
    'very-cold': 'a blue fur-trimmed parka, green neck scarf, knit hat, gloves, and winter boots',
  }),
  rain: Object.freeze({
    hot: 'a lightweight coral rain jacket, shorts, and waterproof shoes',
    warm: 'a turquoise rain jacket, shorts, and waterproof shoes',
    mild: 'a coral rain jacket, jeans, and waterproof shoes',
    cool: 'a rain jacket, long pants, and waterproof shoes',
    cold: 'a blue rain coat, long pants, and waterproof boots',
    'very-cold': 'an insulated blue rain parka, knit hat, gloves, and waterproof winter boots',
  }),
  wind: Object.freeze({
    hot: 'a lightweight coral windbreaker, athletic shorts, and sneakers',
    warm: 'a turquoise windbreaker, shorts, and sneakers',
    mild: 'a lavender windbreaker over a hoodie, jeans, and sneakers',
    cool: 'a yellow windbreaker over a hoodie, pants, and sneakers',
    cold: 'an insulated tan windbreaker over a hoodie, jeans, gloves, and boots',
    'very-cold': 'a teal stormproof parka, green scarf, knit hat, gloves, and winter boots',
  }),
  'high-uv': Object.freeze({
    hot: 'a sleeveless top, shorts, sun hat, sunglasses, and sneakers',
    warm: 'a T-shirt, shorts, sun hat, sunglasses, and sneakers',
    mild: 'a hoodie, jeans, sun hat, sunglasses, and sneakers',
    cool: 'a warm top, long pants, sun hat, sunglasses, and closed-toe shoes',
    cold: 'a coat over a hoodie, jeans, sunglasses, and boots',
    'very-cold': 'a parka, knit hat, gloves, sunglasses, and winter boots',
  }),
  heat: Object.freeze({
    hot: 'a sleeveless top, athletic shorts, and sneakers',
    warm: 'a T-shirt, shorts, and sneakers',
    mild: 'a hoodie, jeans, and sneakers',
    cool: 'a knit sweater, jeans, and sneakers',
    cold: 'a puffer jacket over a sweater, pants, and boots',
    'very-cold': 'a parka, thermal layers, insulated pants, winter boots, a knit hat, and gloves',
  }),
});

export const REMINDER_CONTENT = Object.freeze({
  umbrella: Object.freeze({
    label: 'Umbrella',
    variations: Object.freeze([
      'Bring an umbrella—rain is possible today.',
      'Keep an umbrella nearby for possible showers.',
      'Pack an umbrella before heading to campus.',
    ]),
  }),
  shoes: Object.freeze({
    label: 'Water-resistant shoes',
    variations: Object.freeze([
      'Choose water-resistant shoes for wet conditions.',
      'Wet sidewalks are possible, so protect your feet.',
      'Wear shoes that can handle rain or snow.',
    ]),
  }),
  sunscreen: Object.freeze({
    label: 'Sunscreen',
    variations: Object.freeze([
      'Apply sunscreen before heading outside.',
      'UV levels call for sun protection today.',
      'Remember sunscreen for time between classes.',
    ]),
  }),
  hydration: Object.freeze({
    label: 'Water',
    variations: Object.freeze([
      'Carry water and stay hydrated today.',
      'Warm conditions make a water bottle a good idea.',
      'Bring water for your time on campus.',
    ]),
  }),
});

const MODIFIER_GUIDANCE = Object.freeze({
  rain: 'Add a rain shell and water-resistant shoes.',
  snow: 'Choose insulated outerwear and waterproof boots.',
  highUv: 'Add a sun hat or sunglasses for UV protection.',
  heat: 'Carry a water bottle and take hydration breaks.',
  wind: 'Add a wind-resistant outer layer.',
});

export function buildRecommendationText(outfitDescription, modifiers, primaryModifier = null) {
  const additions = Object.entries(modifiers)
    .filter(([modifier, active]) => active && modifier !== primaryModifier)
    .map(([modifier]) => modifier === 'rain' && primaryModifier === 'snow'
      ? 'Bring an umbrella for mixed precipitation.'
      : MODIFIER_GUIDANCE[modifier]);
  return [`Wear ${outfitDescription}.`, ...additions].join(' ');
}
