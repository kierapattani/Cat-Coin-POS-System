# Cat Coin Register

A kawaii-style POS system with an animated cat that "takes" customer payments with its paw.

## Getting Started

### Installation

```bash
npm run install-all
```

### Run Development

```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

### Build for Production

```bash
npm run build
```

Production builds use IndexedDB (no backend required).

### Preview Production Build

```bash
cd client && npm run preview
```

Open http://localhost:4173 to test the production build locally.

### Deploy

#### Configure Deployment Path

Before building for production, configure the deployment path in `client/src/config.ts`:

```typescript
// For root deployment (e.g., example.com)
export const BASE_PATH = '/';

// For subdirectory deployment (e.g., example.com/pos)
export const BASE_PATH = '/pos/';
```

Change `BASE_PATH` to match your deployment location, then rebuild the app.

#### Upload Files

Upload the contents of `client/dist/` to your web server's public directory. The app will work on any static hosting (shared hosting, Netlify, Vercel, GitHub Pages, etc.) since it uses IndexedDB for storage.

#### Server Configuration for Subdirectory Deployment

If deploying to a subdirectory, configure your web server to handle SPA routing:

**Nginx**
```nginx
location /pos {
    alias /var/www/yoursite/pos;
    try_files $uri $uri/ /pos/index.html;
}
```

## Usage

**POS**: Select products, adjust quantities, choose payment method, and complete payment to trigger the cat paw animation.

**Inventory**: Add/edit/delete products, monitor stock levels, receive low stock alerts.

**Dashboard**: View sales stats, analyze trends with charts, export data as CSV/JSON.

## Configuration

Tax rate: Edit `TAX_RATE` in `client/src/pages/POSRegister.tsx`

Low stock threshold: Edit threshold in `client/src/pages/Inventory.tsx`

## Features

- POS register with cart management, tax calculation, and payment processing
- Animated cat paw that grabs payment on checkout
- Real-time treats counter based on daily revenue
- Cat character with mood reactions (idle, happy, worried, sleeping)
- Inventory management with add/edit/delete products
- Low stock alerts with automatic tracking
- Sales dashboard with charts showing 7-day trends
- Export sales data to CSV or JSON
- Pastel kawaii theme with smooth animations
- Dual storage: SQLite for development, IndexedDB for production
