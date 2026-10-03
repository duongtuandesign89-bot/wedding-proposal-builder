# Solis Studio Proposal Builder

Wedding photography & film proposal builder with a local proposal library and continuous JPG/PNG export.

## Development

```sh
npm install
npm run dev
```

## Tests

```sh
npm test
```

## Production build and preview

```sh
npm run build
npm run preview
```

No API key or secret is required.

## Local data

Proposal data and Hero images are stored locally in IndexedDB, separately for each browser and site origin. Clearing browser/site data can permanently remove local proposals. JPG/PNG exports are images, not restorable proposal backups.
