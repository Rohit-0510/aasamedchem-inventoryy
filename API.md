# API Documentation

## Authentication

All endpoints except `/login` require a valid session.

### Login Endpoint

```http
POST /api/auth/callback/credentials
Content-Type: application/json

{
  "email": "admin@aasa.com",
  "password": "admin123"
}
```

**Response:**
- Success: Redirects to dashboard
- Failure: Returns to login with error

---

## Products API

### List Products

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `search` (optional): Search by name, SKU, or description
- `category` (optional): Filter by category
- `unit` (optional): Filter by unit (g, kg, L, mL, unit)

**Example Requests:**

```bash
# Get all products
curl http://localhost:3000/api/products

# Search for aspirin
curl "http://localhost:3000/api/products?search=aspirin"

# Filter by category
curl "http://localhost:3000/api/products?category=Tablets"

# Filter by unit
curl "http://localhost:3000/api/products?unit=kg"

# Combine filters
curl "http://localhost:3000/api/products?search=vitamin&category=Vitamins&unit=unit"
```

**Response:**
```json
[
  {
    "id": "clh123abc",
    "name": "Aspirin Tablets",
    "sku": "ASP-500",
    "description": "Aspirin 500mg tablets",
    "category": "Tablets",
    "baseUnit": "unit",
    "basePricePerUnit": "2.50",
    "stockQuantity": "5000",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### Create Product (Admin Only)

**Endpoint:** `POST /api/products`

**Headers:**
```
Content-Type: application/json
Cookie: [NextAuth session cookie]
```

**Request Body:**
```json
{
  "name": "New Product",
  "sku": "NEW-001",
  "description": "Product description",
  "category": "Category Name",
  "baseUnit": "g",
  "basePricePerUnit": "150.00",
  "stockQuantity": "1000"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vitamin B12 Tablets",
    "sku": "VIT-B12-100",
    "description": "Vitamin B12 1000mcg tablets",
    "category": "Vitamins",
    "baseUnit": "unit",
    "basePricePerUnit": "25.50",
    "stockQuantity": "5000"
  }'
```

**Responses:**

Success (201):
```json
{
  "id": "clh456def",
  "name": "Vitamin B12 Tablets",
  "sku": "VIT-B12-100",
  ...
}
```

Error (400):
```json
{ "error": "SKU already exists" }
```

Error (403):
```json
{ "error": "Forbidden" }
```

---

### Update Product (Admin Only)

**Endpoint:** `PUT /api/products/[id]`

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "category": "New Category",
  "basePricePerUnit": "200.00",
  "stockQuantity": "2000",
  "isActive": true
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/products/clh123abc \
  -H "Content-Type: application/json" \
  -d '{
    "basePricePerUnit": "3.00",
    "stockQuantity": "6000"
  }'
```

---

### Delete Product (Admin Only)

**Endpoint:** `DELETE /api/products/[id]`

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/products/clh123abc
```

**Response:**
```json
{ "success": true }
```

---

## Orders API

### List Orders

**Endpoint:** `GET /api/orders`

**Authorization:**
- Sellers see only their own orders
- Admins see all orders

**Response:**
```json
[
  {
    "id": "clh789ghi",
    "orderNumber": "ORD-20240115093000-1234",
    "sellerId": "clh111aaa",
    "status": "PENDING",
    "totalAmount": "450.50",
    "notes": "Urgent delivery needed",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "seller": {
      "name": "John Seller",
      "email": "seller@aasa.com"
    },
    "orderItems": [
      {
        "id": "clh789item1",
        "productId": "clh123abc",
        "orderedUnit": "kg",
        "orderedQuantity": "1.5",
        "baseQuantity": "1500",
        "unitPrice": "150.00",
        "totalPrice": "225.00",
        "product": {
          "id": "clh123abc",
          "name": "Paracetamol Powder",
          "sku": "PAR-100G"
        }
      }
    ]
  }
]
```

---

### Get Order Details

**Endpoint:** `GET /api/orders/[id]`

**Authorization:**
- Sellers can only view their own orders
- Admins can view any order

**Response:** Same as single order object from list

---

### Create Order (Seller Only)

**Endpoint:** `POST /api/orders`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "clh123abc",
      "orderedUnit": "kg",
      "orderedQuantity": "1.5"
    },
    {
      "productId": "clh456def",
      "orderedUnit": "unit",
      "orderedQuantity": "10"
    }
  ],
  "notes": "Special delivery instructions"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "clh123abc",
        "orderedUnit": "kg",
        "orderedQuantity": "2"
      },
      {
        "productId": "clh456def",
        "orderedUnit": "L",
        "orderedQuantity": "0.5"
      }
    ],
    "notes": "Rush order"
  }'
```

**Response (201):**
```json
{
  "id": "clh789ghi",
  "orderNumber": "ORD-20240115093000-1234",
  "sellerId": "clh111aaa",
  "status": "PENDING",
  "totalAmount": "525.75",
  "notes": "Rush order",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "orderItems": [...]
}
```

---

### Update Order Status (Admin Only)

**Endpoint:** `PUT /api/orders/[id]`

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Valid Statuses:**
- `PENDING` (initial state)
- `CONFIRMED` (approved)
- `CANCELLED` (rejected)

**Example:**
```bash
# Confirm order
curl -X PUT http://localhost:3000/api/orders/clh789ghi \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'

# Cancel order
curl -X PUT http://localhost:3000/api/orders/clh789ghi \
  -H "Content-Type: application/json" \
  -d '{"status": "CANCELLED"}'
```

---

## Unit Conversion Examples

When creating orders, sellers can order in any unit. The system automatically converts to base unit:

### Weight Conversion
```javascript
// Product: Paracetamol Powder
// Base Unit: g
// Base Price: ₹150 per g

// Seller orders 1 kg:
{
  "orderedUnit": "kg",
  "orderedQuantity": "1"
}

// Internally converts to:
// baseQuantity: 1000 g
// unitPrice: ₹150,000 per kg
// totalPrice: ₹150,000
```

### Volume Conversion
```javascript
// Product: Cough Syrup
// Base Unit: mL
// Base Price: ₹8 per mL

// Seller orders 0.5 L:
{
  "orderedUnit": "L",
  "orderedQuantity": "0.5"
}

// Internally converts to:
// baseQuantity: 500 mL
// unitPrice: ₹4,000 per L
// totalPrice: ₹2,000
```

### Countable Units
```javascript
// Product: Aspirin Tablets
// Base Unit: unit
// Base Price: ₹2.50 per unit

// Seller orders 100 pieces:
{
  "orderedUnit": "unit",
  "orderedQuantity": "100"
}

// No conversion needed
// baseQuantity: 100 unit
// unitPrice: ₹2.50 per unit
// totalPrice: ₹250
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Product name is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create order"
}
```

---

## Authentication Flow

1. **User submits login form**
   ```bash
   POST /api/auth/callback/credentials
   email=seller@aasa.com&password=seller123
   ```

2. **System validates credentials**
   - Hashes password and compares
   - Retrieves user role

3. **Session created**
   - NextAuth creates secure session
   - Session stored in cookie

4. **Access protected routes**
   - Middleware checks session
   - Validates user role
   - Allows/redirects request

5. **Make API calls with session**
   - Session automatically sent in cookies
   - Backend validates in each request

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- Implement rate limiting per user
- Use Redis for rate limit storage
- Limit: 100 requests per minute per user

---

## Testing with cURL

### Test User Login Flow
```bash
# Try login
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -d "email=seller@aasa.com&password=seller123"

# Get products after login
curl -b "sessionId=..." http://localhost:3000/api/products
```

### Test Product Creation (Admin)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth_cookie]" \
  -d '{"name":"Test","sku":"TEST-001","baseUnit":"g","basePricePerUnit":"100","stockQuantity":"1000"}'
```

---

## Pagination

Currently implements limit-based response. For large datasets:
- Add `limit` and `offset` query parameters
- Implement cursor-based pagination
- Cache frequently accessed products

---

For more details, see the [SETUP.md](./SETUP.md) and [IMPLEMENTATION.md](./IMPLEMENTATION.md) files.
