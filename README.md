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
