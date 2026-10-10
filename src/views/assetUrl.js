const assetUrls = {
  ...import.meta.glob('../assets/delivery/character/master-bichon.png', {
    eager: true, query: '?url', import: 'default',
  }),
  ...import.meta.glob('../assets/delivery/character/outfits/*.png', {
    eager: true, query: '?url', import: 'default',
  }),
  ...import.meta.glob('../assets/delivery/character/weather/*.png', {
    eager: true, query: '?url', import: 'default',
  }),
  ...import.meta.glob('../assets/icons/**/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
  }),
};

export function assetUrl(relativePath) {
  return assetUrls[`../assets/delivery/${relativePath}`]
    ?? assetUrls[`../assets/${relativePath}`]
    ?? null;
}
