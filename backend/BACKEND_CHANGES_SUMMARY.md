# Backend Changes Summary

## DB Schema Expansion (2026-06-28)

Restructured the MongoDB database to match a full e-commerce schema with 15 collections (up from 7).

### New Collections

| Collection | Purpose |
|---|---|
| `user_addresses` | Saved delivery addresses per user (default flag, multi-address support) |
| `user_otps` | OTP records for email verification / 2FA (TTL index — auto-expire) |
| `tokens` | Refresh / password-reset tokens (TTL index — auto-expire) |
| `inventory` | One stock record per product (`stock_quantity`, `reserved_quantity`) |
| `cart` | DB-backed shopping cart (replaces in-memory frontend cart) |
| `roles` | Role definitions: admin, vendor, customer |
| `permissions` | 15 fine-grained permissions (products:write, orders:update, etc.) |
| `user_roles` | Junction — links users to roles |
| `role_permissions` | Junction — links roles to permissions |
| `payments` | Payment records (gateway, status, transaction_id, paid_at) |
| `order_items` | Indexed separately for reporting (mirrors embedded order items) |

### Updated Collections

- **`users`** — added `username`, `is2FA`, `status`, `createdby` fields
- **`products`** — added `sku` (e.g. `SED-TOM-001`), `discount_percent` (auto-calculated)
- **`categories`** — added `parent_id` for hierarchical sub-categories, `status`
- **`orders`** — added `shipping_address` (ref to `user_addresses._id`)

### New API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | user | Get cart with product details and total |
| POST | `/api/cart` | user | Add item (merges qty if already in cart) |
| PATCH | `/api/cart/{product_id}` | user | Update item quantity |
| DELETE | `/api/cart/{product_id}` | user | Remove item |
| DELETE | `/api/cart` | user | Clear entire cart |
| GET | `/api/addresses` | user | List saved addresses |
| POST | `/api/addresses` | user | Create address (auto-default if first) |
| PATCH | `/api/addresses/{id}` | user | Update address |
| PATCH | `/api/addresses/{id}/set-default` | user | Set as default |
| DELETE | `/api/addresses/{id}` | user | Delete (auto-promotes next to default) |
| GET | `/api/inventory` | admin | List all inventory |
| GET | `/api/inventory/{product_id}` | user | Get stock for a product |
| PATCH | `/api/inventory/{product_id}` | admin/vendor | Adjust stock (add/subtract/set) |
| POST | `/api/inventory` | admin | Create inventory record manually |
| GET | `/api/payment/history` | user | User's payment history |

### Updated Routes

- **`/api/payment/initiate`** — now persists a `pending` payment record in `payments` collection
- **`/api/payment/verify`** — now marks the payment record `success` + records `paid_at`

### Seed (`python seed.py`)

Seeds all new collections:
- 3 roles + 15 permissions + role-permission mappings
- 30 inventory records (one per product, synced to product `stock`)
- Products now include `sku` codes and `discount_percent`
- Categories now include `parent_id: null` (ready for sub-categories)
