# FarmBasket Agro Store

A complete FarmBasket web app scaffold with organized frontend and backend folders.

## Structure

- `frontend/` — static web app files for the public storefront
- `backend/` — Node.js/Express API and data model skeleton

## Run

### Frontend only

1. Open `farmbasket/frontend/index.html` in your browser
2. Or use a local static server from the same folder

### Backend

```bash
cd farmbasket/backend
npm install
cp .env.example .env
# edit .env as needed
npm run dev
```

## Notes

- Frontend files are in `farmbasket/frontend`
- Backend files are in `farmbasket/backend`
- `.env.example` contains the variables required for API and payment flow
