
Here is the full API Documentation (API_DOCS.md):

# Dipto Fashion — Complete REST API Documentation
> **For Android (React Native) App Integration**
> Generated: 2026-08-10 | Source: `backend/server.js`, `backend/routes/`, `backend/models/`, `frontend/src/api.js`

---

## 🌐 Base URL

```
https://dipto-fashion-backend.onrender.com
```

> All endpoints are prefixed with `/api/`. The server also accepts the same routes **without** the `/api/` prefix as aliases (e.g., `/products` == `/api/products`). Always prefer the `/api/` prefixed versions in production.

---

## 🔐 Authentication

Most endpoints require **JWT Bearer Token** authentication.

| Header | Value |
|---|---|
| `Authorization` | `Bearer <jwt_token>` |
| `Content-Type` | `application/json` |

- Token is returned on login/register and has a **7-day expiry** for users.
- Admin token has a **1-day expiry**.
- Store securely using Android Keystore / EncryptedSharedPreferences.

---

## 💳 Payment Gateway

| Key | Value |
|---|---|
| **Razorpay Key ID** | `rzp_live_TMnf64UYjTg87s` |
| **Currency** | `INR` |

---

## 📡 Real-Time Events (Socket.IO)

Connect to the **same Base URL** using the Socket.IO client library. Use `transports: ['websocket', 'polling']`.

| Event Name | Payload | Description |
|---|---|---|
| `new_order_placed` | Order object | Fired when a new order is placed |
| `order_status_updated` | Order object | Fired when admin updates order status |
| `product_added` | Product object | Fired when admin adds a product |
| `product_updated` | Product object | Fired when admin edits a product |
| `product_deleted` | `productId` (string) | Fired when admin deletes a product |
| `user_profile_updated` | User object | Fired when a user updates their profile |

---
---

## 1. 🏥 Health Check

### `GET /`
### `GET /health`
### `GET /api`

**Auth Required:** No

**Response `200`:**
```json
{
  "message": "Dipto Fashion API Backend is Live!",
  "status": "OK",
  "store": "Dipto Fashion"
}
```

---
---

## 2. 🔑 Authentication

### `POST /api/auth/pre-check-signup`

Pre-validates email and phone uniqueness **before** OTP is sent. Does **not** create the user.

**Auth Required:** No
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "mypassword123",
  "phone": "9876543210"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✅ | — |
| `email` | string | ✅ | Must be unique |
| `password` | string | ✅ | Min 8 characters |
| `phone` | string | ✅ | Must be unique |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Signup details validated. Ready for OTP verification."
}
```

**Error Responses `400`:**
```json
{ "message": "Phone number is already registered" }
{ "message": "Email is already registered" }
{ "message": "Password must be at least 8 characters long" }
{ "message": "Name, email, password, and phone number are required" }
```

---

### `POST /api/auth/register`

Creates a new user account. Call this **only after** OTP verification succeeds on the client side.

**Auth Required:** No
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "mypassword123",
  "phone": "9876543210"
}
```

**Success Response `200`:**
```json
{
  "token": "<jwt_token_7_day_expiry>",
  "user": {
    "id": "64abc123def456...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "role": "user",
    "addresses": []
  }
}
```

**Error Responses `400`:**
```json
{ "message": "Phone number is already registered" }
{ "message": "Email is already registered" }
```

---

### `POST /api/auth/login`

Login using phone number and password.

**Auth Required:** No
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "phone": "9876543210",
  "password": "mypassword123"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `phone` | string | ✅ | Registered phone number |
| `password` | string | ✅ | Min 8 characters |

**Success Response `200`:**
```json
{
  "token": "<jwt_token_7_day_expiry>",
  "user": {
    "id": "64abc123def456...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "role": "user",
    "addresses": [
      {
        "_id": "64addr...",
        "userName": "Rahul Sharma",
        "mobileNumber": "9876543210",
        "address": "123 Main Street, Kolkata",
        "landmark": "Near City Mall",
        "pincode": "700001",
        "isDefault": true,
        "createdAt": "2026-08-01T10:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses `400`:**
```json
{ "message": "No registered user found with this phone number" }
{ "message": "Incorrect password entered" }
```

---

### `POST /api/auth/reset-password`

Resets a user's password using their registered phone number. Call **after** OTP verification succeeds on the client side.

**Auth Required:** No
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "phone": "9876543210",
  "newPassword": "newpassword123"
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Password updated successfully in database"
}
```

**Error Responses:**
```json
{ "message": "No account found with this registered phone number" }   // 404
{ "message": "Password must be at least 8 characters long" }          // 400
```

---

### `POST /api/admin/login`

Admin-only login.

**Auth Required:** No
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "sudipta@gmail.com",
  "password": "sudipta@12345"
}
```

**Success Response `200`:**
```json
{
  "token": "<admin_jwt_token_1_day_expiry>",
  "admin": {
    "name": "Admin Sudipta",
    "email": "sudipta@gmail.com",
    "role": "admin"
  }
}
```

**Error Response `401`:**
```json
{ "message": "Invalid Admin Credentials! Access Denied." }
```

---
---

## 3. 👤 User Profile

### `PUT /api/user/profile`

Update display name, gender, and/or avatar. **Email and phone are permanently immutable.**

**Auth Required:** `Authorization: Bearer <token>` *(or query param `?email=...` as fallback)*
**Aliases:** `PUT /api/users/profile`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Rahul Sharma Updated",
  "gender": "Male",
  "avatar": "data:image/png;base64,iVBORw0KGgo..."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Display name |
| `gender` | string | ❌ | `"Male"` \| `"Female"` \| `"Other"` \| `"Prefer not to say"` \| `""` |
| `avatar` | string | ❌ | Base64 encoded image string or URL |

**Success Response `200`:**
```json
{
  "success": true,
  "user": {
    "id": "64abc123...",
    "_id": "64abc123...",
    "name": "Rahul Sharma Updated",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "gender": "Male",
    "avatar": "data:image/png;base64,...",
    "role": "user",
    "addresses": []
  }
}
```

> **Note:** On success, a `user_profile_updated` Socket.IO event is also broadcast for real-time cross-device sync.

---
---

## 4. 📍 Addresses

### `GET /api/user/addresses`

Fetch all saved delivery addresses for the logged-in user.

**Auth Required:** `Authorization: Bearer <token>` *(or query param `?email=...` / `?userEmail=...`)*
**Aliases:** `GET /api/user/address`, `GET /api/addresses`

**Response `200`:** *(Array of address objects)*
```json
[
  {
    "_id": "64addr...",
    "userName": "Rahul Sharma",
    "mobileNumber": "9876543210",
    "address": "123 Main Street, Kolkata",
    "landmark": "Near City Mall",
    "pincode": "700001",
    "isDefault": true,
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-01T10:00:00.000Z"
  }
]
```

---

### `POST /api/user/addresses`

Add a new delivery address for the logged-in user.

**Auth Required:** `Authorization: Bearer <token>` *(or body field `email` / query `?email=...`)*
**Aliases:** `POST /api/user/address`, `POST /api/addresses`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "userName": "Rahul Sharma",
  "mobileNumber": "9876543210",
  "address": "123 Main Street, Kolkata",
  "landmark": "Near City Mall",
  "pincode": "700001"
}
```

| Field | Type | Required |
|---|---|---|
| `userName` | string | ✅ |
| `mobileNumber` | string | ✅ |
| `address` | string | ✅ |
| `pincode` | string | ✅ |
| `landmark` | string | ❌ |

**Response `200`:** *(Updated full addresses array — same schema as GET)*

---

### `DELETE /api/user/addresses/:id`

Delete a specific address by its `_id`.

**Auth Required:** `Authorization: Bearer <token>` *(or query param `?email=...`)*
**Aliases:** `DELETE /api/user/address/:id`, `DELETE /api/addresses/:id`
**URL Param:** `:id` — the `_id` field of the address object to delete

**Response `200`:**
```json
{
  "success": true,
  "addresses": []
}
```

**Error Response `404`:**
```json
{ "success": false, "message": "User not found" }
```

---
---

## 5. 🗂️ Categories

### `GET /api/categories`

Fetch all product categories. Cached for 5 minutes.

**Auth Required:** No
**Aliases:** `GET /categories`

**Response `200`:**
```json
[
  {
    "_id": "64cat1...",
    "name": "Saree",
    "description": "Traditional & Designer Sarees"
  },
  {
    "_id": "64cat2...",
    "name": "Punjabi",
    "description": "Royal & Festival Punjabi Suits"
  }
]
```

---

### `POST /api/categories`

Create a new category. *(Admin only — convention restricted)*

**Auth Required:** No
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Lehenga",
  "description": "Bridal and Party Lehengas"
}
```

**Response `200`:** *(New category object)*

---

### `PUT /api/categories/:id`

Update a category. *(Admin only)*

**URL Param:** `:id` — category `_id`
**Request Body:** Same schema as POST above.

**Response `200`:** *(Updated category object)*

---

### `DELETE /api/categories/:id`

Delete a category. *(Admin only)*

**URL Param:** `:id`

**Response `200`:**
```json
{ "message": "Category deleted successfully" }
```

---
---

## 6. 🛍️ Products

### ⚠️ Stock Fields — Critical for Android

| Field | Type | Description |
|---|---|---|
| `quantity` | `Number` | **Total stock** set by admin on creation. This value is **never decremented** on sales. Think of it as "max capacity". |
| `remainingStock` | `Number` | **Live available stock**. Decrements on accepted orders. Restored on cancellations/returns. |
| `price` | `Number` | Selling / offer price in ₹ |
| `mrp` | `Number` | Maximum Retail Price in ₹ |
| `rating` | `Number` | Average rating (1.0 – 5.0) |
| `reviewsCount` | `Number` | Total number of customer reviews |

> **Out-of-stock logic:** There is **no** `is_out_of_stock` boolean field in the API. Compute it yourself:
> ```kotlin
> val isOutOfStock = product.remainingStock <= 0
> ```

---

### `GET /api/products`

Fetch all products. Supports category filtering and full-text search. Cached for 5 minutes.

**Auth Required:** No
**Aliases:** `GET /products`

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category name (e.g., `Saree`, `Punjabi`). Use `"All"` or omit for all. |
| `search` | string | Full-text search across product `name`, `category`, and `description`. |

**Example:** `GET /api/products?category=Saree&search=banarasi`

**Response `200`:** *(Array of product objects, sorted by newest first)*
```json
[
  {
    "_id": "64prod1...",
    "name": "Kanjivaram Pure Silk Saree",
    "category": "Saree",
    "mrp": 5999,
    "price": 2499,
    "quantity": 15,
    "remainingStock": 12,
    "images": [
      "https://images.unsplash.com/photo-1610030469983...",
      "https://images.unsplash.com/photo-1617627143750..."
    ],
    "image": "https://images.unsplash.com/photo-1610030469983...",
    "rating": 4.8,
    "reviewsCount": 428,
    "availableSizes": ["S", "M", "L", "XL"],
    "description": "Exquisite Golden Zari Woven Royal Silk Saree with Blouse Piece",
    "reviews": [
      {
        "userName": "Priya Devi",
        "rating": 5,
        "comment": "Absolutely gorgeous saree!",
        "createdAt": "2026-07-20T08:00:00.000Z"
      }
    ],
    "createdAt": "2026-07-15T08:00:00.000Z",
    "updatedAt": "2026-08-01T10:00:00.000Z"
  }
]
```

---

### `POST /api/products`

Create a new product. *(Admin only)*

**Auth Required:** No *(convention restricted)*
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Banarasi Silk Saree",
  "category": "Saree",
  "mrp": 4999,
  "price": 2199,
  "quantity": 20,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "description": "Elegant Banarasi Silk Saree with gold border",
  "rating": 4.5,
  "reviewsCount": 142
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Product title |
| `category` | string | ✅ | Must match an existing category name |
| `mrp` | number | ✅ | Original price in ₹ |
| `price` | number | ✅ | Selling price in ₹ |
| `images` | string[] | ✅ | Min 1 image URL required |
| `quantity` | number | ❌ | Defaults to `10`. Sets both `quantity` and `remainingStock`. |
| `description` | string | ❌ | — |
| `rating` | number | ❌ | Defaults to `4.5` |
| `reviewsCount` | number | ❌ | Defaults to `142` |

**Response `200`:** *(Full product object — same schema as GET above)*

---

### `PUT /api/products/:id`

Update an existing product. *(Admin only)*

**URL Param:** `:id` — product MongoDB `_id`
**Request Body:** Same fields as POST above (all are required for update).

> **Stock recalculation on update:**
> `newRemaining = max(0, oldRemaining + (newQuantity - oldQuantity))`
> The `remainingStock` is never blindly reset to `quantity` on update — only the delta is applied.

**Response `200`:** *(Updated full product object)*

---

### `DELETE /api/products/:id`

Delete a product. *(Admin only)*

**URL Param:** `:id`

**Response `200`:**
```json
{ "message": "Product deleted successfully" }
```

---

### `POST /api/products/:id/review`

Submit a customer rating and review for a product.

**Auth Required:** No
**URL Param:** `:id` — product `_id`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Beautiful saree! Loved the quality.",
  "userName": "Priya Devi"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `rating` | number | ✅ | Integer between `1` and `5` inclusive |
| `comment` | string | ❌ | Review text |
| `userName` | string | ❌ | Defaults to `"Customer"` |

**Response `200`:** *(Full updated product object with recalculated `rating` and `reviewsCount`)*

---
---

## 7. 🛒 Orders

### Order Status Lifecycle

```
Pending Verification  →  Accepted  →  Shipped  →  Out for Delivery  →  Delivered
        |                    |
        └── Rejected          └── Cancellation Requested  →  Cancelled
                                             |
                                     Return Requested  →  Return Approved  →  Refund Completed
```

| Status | Triggered By | Stock Side Effect |
|---|---|---|
| `Pending Verification` | Default for UPI/QR orders | Stock deducted immediately on placement |
| `Accepted` | Admin confirms payment | Stock deducted (if not already) |
| `Shipped` | Admin updates | Stock deducted (if not already) |
| `Out for Delivery` | Admin updates | Stock deducted (if not already) |
| `Delivered` | Admin updates | Stock deducted (if not already) |
| `Rejected` | Admin rejects order | ✅ Stock restored |
| `Cancellation Requested` | User requests cancel | No change |
| `Cancelled` | Admin approves cancel | ✅ Stock restored |
| `Return Requested` | User submits return | No change |
| `Return Approved` | Admin approves return | ✅ Stock restored |
| `Refund Completed` | Admin marks refund done | ✅ Stock restored |

---

### `POST /api/orders`

Place a new order (UPI / QR code payment).

**Auth Required:** `Authorization: Bearer <token>` — **Mandatory**
**Aliases:** `POST /orders`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "64prod1...",
      "name": "Kanjivaram Pure Silk Saree",
      "quantity": 2,
      "price": 2499,
      "mrp": 5999,
      "image": "https://example.com/image.jpg",
      "selectedSize": "M"
    }
  ],
  "totalAmount": 4998,
  "couponCode": "WELCOME100",
  "couponDiscount": 100,
  "shippingAddress": {
    "userName": "Rahul Sharma",
    "email": "rahul@example.com",
    "mobileNumber": "9876543210",
    "address": "123 Main Street, Kolkata",
    "landmark": "Near City Mall",
    "pincode": "700001"
  },
  "utrNumber": "UTR123456789012",
  "paymentMethod": "UPI_QR",
  "orderId": "DF-123456"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `items` | array | ✅ | Min 1 item |
| `totalAmount` | number | ✅ | Final payable amount in ₹ |
| `shippingAddress` | object | ✅ | Full delivery address |
| `utrNumber` | string | ✅ | UTR reference number from UPI payment |
| `paymentMethod` | string | ❌ | `"UPI_QR"` (default) |
| `couponCode` | string | ❌ | Applied coupon code |
| `couponDiscount` | number | ❌ | Discount amount in ₹ |
| `orderId` | string | ❌ | Custom ID. Auto-generated as `DF-XXXXXX` if not sent |

**Success Response `200`:** *(Full order object)*
```json
{
  "_id": "64ord...",
  "orderId": "DF-123456",
  "user": "64user...",
  "userName": "Rahul Sharma",
  "userEmail": "rahul@example.com",
  "shippingAddress": {
    "userName": "Rahul Sharma",
    "email": "rahul@example.com",
    "mobileNumber": "9876543210",
    "address": "123 Main Street, Kolkata",
    "landmark": "Near City Mall",
    "pincode": "700001"
  },
  "items": [
    {
      "productId": "64prod1...",
      "name": "Kanjivaram Pure Silk Saree",
      "quantity": 2,
      "price": 2499,
      "mrp": 5999,
      "image": "https://example.com/image.jpg",
      "selectedSize": "M"
    }
  ],
  "totalAmount": 4998,
  "couponCode": "WELCOME100",
  "couponDiscount": 100,
  "utrNumber": "UTR123456789012",
  "paymentMethod": "UPI_QR",
  "status": "Pending Verification",
  "stockDeducted": true,
  "stockRestored": false,
  "returnStockRestored": false,
  "rejectionReason": "",
  "refundId": "",
  "razorpayOrderId": "",
  "razorpayPaymentId": "",
  "razorpaySignature": "",
  "cancellationDetails": {
    "reason": "",
    "upiId": "",
    "accountHolder": "",
    "bankName": "",
    "accountNumber": "",
    "ifscCode": "",
    "refundToSource": false
  },
  "returnDetails": {
    "reason": "",
    "accountHolder": "",
    "bankName": "",
    "accountNumber": "",
    "ifscCode": "",
    "upiId": "",
    "notes": "",
    "pickupDate": ""
  },
  "createdAt": "2026-08-10T02:00:00.000Z",
  "updatedAt": "2026-08-10T02:00:00.000Z"
}
```

**Error Responses:**
```json
{ "success": false, "message": "Sign-in mandatory to place order" }                                       // 401
{ "success": false, "message": "Invalid or expired user session" }                                        // 401
{ "success": false, "message": "Incomplete order details" }                                               // 400
{ "success": false, "message": "Insufficient stock for <Product>. Requested: 3, Available: 1" }          // 400
```

---

### `GET /api/user/my-orders`

Fetch all orders for the logged-in user (max 50, newest first).

**Auth Required:** `Authorization: Bearer <token>` *(or query param `?email=...`)*
**Aliases:** `GET /api/orders/my-orders`, `GET /api/orders/user`, `GET /api/orders/by-email`
**Query Params:** `?email=rahul@example.com` *(optional fallback if no token)*

**Response `200`:** *(Array of order objects — same full schema as POST response above)*

---

### `GET /api/orders`

Fetch **all** orders for admin panel with optional pagination.

**Auth Required:** No *(convention restricted to admin)*
**Aliases:** `GET /api/admin/orders`

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `0` | Items per page. `0` = return all records. |

**Response Header:** `X-Total-Count: <total_order_count>`
**Response `200`:** *(Array of order objects)*

---

### `PUT /api/orders/:id/status`

Update an order's status. *(Admin only)*

**URL Param:** `:id` — order MongoDB `_id`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "status": "Shipped",
  "rejectionReason": ""
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `status` | string | ✅ | See the Order Status Lifecycle table above |
| `rejectionReason` | string | ❌ | Should be filled when `status` is `"Rejected"` |

**Response `200`:** *(Updated full order object)*

---

### `POST /api/orders/:id/cancel`

User submits a cancellation request. Sets status to `"Cancellation Requested"` pending admin approval.

**URL Param:** `:id` — order MongoDB `_id`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "reason": "Changed my mind",
  "refundToSource": true,
  "upiId": "rahul@upi",
  "accountHolder": "Rahul Sharma",
  "bankName": "SBI",
  "accountNumber": "123456789012",
  "ifscCode": "SBIN0001234"
}
```

> All refund fields are optional. Provide either `upiId` OR bank account details for refund processing.

**Success Response `200`:**
```json
{
  "message": "Cancellation request submitted. Awaiting admin approval.",
  "order": {}
}
```

**Error Response `400`:**
```json
{ "message": "Cannot cancel order once it has been shipped, delivered, or a cancellation request is already pending!" }
```

---

### `POST /api/orders/:id/approve-cancellation`

Admin approves a pending cancellation. Triggers Razorpay auto-refund if paid online. *(Admin only)*

**URL Param:** `:id` — order MongoDB `_id`

**Success Response `200`:**
```json
{
  "message": "Cancellation approved. Order cancelled and stock restored.",
  "order": {}
}
```

**Error Response `400`:**
```json
{ "message": "Order is not in Cancellation Requested state." }
{ "message": "Razorpay Auto-Refund Failed: <reason>" }
```

---

### `POST /api/orders/:id/return`

User submits a return request for a delivered order.

**URL Param:** `:id` — order MongoDB `_id`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "reason": "Product received was damaged",
  "accountHolder": "Rahul Sharma",
  "bankName": "HDFC",
  "accountNumber": "9876543210",
  "ifscCode": "HDFC0001234",
  "upiId": "rahul@hdfc",
  "notes": "Please arrange pickup before 5 PM"
}
```

| Field | Type | Required |
|---|---|---|
| `reason` | string | ✅ |
| `accountHolder` | string | ❌ |
| `bankName` | string | ❌ |
| `accountNumber` | string | ❌ |
| `ifscCode` | string | ❌ |
| `upiId` | string | ❌ |
| `notes` | string | ❌ |

**Response `200`:** *(Updated order with `status: "Return Requested"`. `returnDetails.pickupDate` is auto-set to 3 days from now.)*

---

### `GET /api/admin/returns`

Fetch all orders with return or cancellation statuses. *(Admin only)*

**Response `200`:** *(Array of order objects filtered to: `Return Requested`, `Return Approved`, `Refund Completed`, `Cancellation Requested`, and `Cancelled` with user-submitted requests)*

---
---

## 8. 💳 Payments (Razorpay)

### `POST /api/payment/create-order`

Create a Razorpay payment order. Use the returned `id` in the Razorpay Android SDK checkout.

**Auth Required:** No
**Aliases:** `/api/payments/create-order`, `/api/payment/razorpay-order`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "amount": 4998,
  "currency": "INR",
  "receipt": "rcpt_order_abc123"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `amount` | number | ✅ | Amount in **₹ (rupees)** — server converts to paise internally |
| `currency` | string | ❌ | Defaults to `"INR"` |
| `receipt` | string | ❌ | Auto-generated if not provided |

**Success Response `200`:**
```json
{
  "success": true,
  "id": "order_Razorpay123456",
  "amount": 499800,
  "currency": "INR",
  "key": "rzp_live_TMnf64UYjTg87s"
}
```

> Use `id` as the `order_id` in the Razorpay Android SDK checkout options.

---

### `POST /api/payment/verify-razorpay`

Verify the Razorpay payment signature and register the order in the database.

**Auth Required:** `Authorization: Bearer <token>` *(optional but recommended)*
**Aliases:** `/api/payments/verify-razorpay`, `/api/payment/verify`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "razorpay_order_id": "order_Razorpay123456",
  "razorpay_payment_id": "pay_AbCdEf123456",
  "razorpay_signature": "hmac_sha256_signature_string",
  "items": [
    {
      "productId": "64prod1...",
      "name": "Kanjivaram Pure Silk Saree",
      "quantity": 2,
      "price": 2499,
      "mrp": 5999,
      "image": "https://example.com/image.jpg",
      "selectedSize": "M"
    }
  ],
  "totalAmount": 4998,
  "couponCode": "WELCOME100",
  "couponDiscount": 100,
  "shippingAddress": {
    "userName": "Rahul Sharma",
    "email": "rahul@example.com",
    "mobileNumber": "9876543210",
    "address": "123 Main Street, Kolkata",
    "landmark": "Near City Mall",
    "pincode": "700001"
  },
  "customOrderId": "DF-123456",
  "userEmail": "rahul@example.com",
  "userName": "Rahul Sharma"
}
```

| Field | Type | Required |
|---|---|---|
| `items` | array | ✅ |
| `totalAmount` | number | ✅ |
| `shippingAddress` | object | ✅ |
| `razorpay_order_id` | string | ❌ |
| `razorpay_payment_id` | string | ❌ |
| `razorpay_signature` | string | ❌ |
| `customOrderId` | string | ❌ |
| `couponCode` | string | ❌ |
| `couponDiscount` | number | ❌ |

**Success Response `200`:** *(Full order object with `status: "Accepted"`, `paymentMethod: "RAZORPAY"`. The `utrNumber` is auto-set to `"RZP_<payment_id>"`)*

---
---

## 9. 🎟️ Coupons

### Coupon Object Schema

```json
{
  "_id": "64coupon...",
  "code": "MEGA15",
  "discountType": "percentage",
  "discountAmount": 15,
  "maxDiscountAmount": 300,
  "minOrderAmount": 1499,
  "description": "Get 15% OFF up to ₹300 on orders above ₹1,499.",
  "isActive": true,
  "expiryDate": null,
  "createdAt": "2026-08-01T00:00:00.000Z",
  "updatedAt": "2026-08-01T00:00:00.000Z"
}
```

| Field | Description |
|---|---|
| `discountType` | `"fixed"` = flat rupee discount \| `"percentage"` = percentage of cart total |
| `discountAmount` | For `fixed`: rupee amount. For `percentage`: percentage value (e.g. `15` = 15%) |
| `maxDiscountAmount` | For `percentage` only — maximum rupee cap. `0` = no cap. |
| `minOrderAmount` | Minimum cart total required to apply this coupon. `0` = no minimum. |

---

### `GET /api/coupons/active`

Fetch all active coupons for display in app. **Public.**

**Auth Required:** No
**Aliases:** `/api/coupons/public`

**Response `200`:** *(Array of active coupon objects)*

---

### `POST /api/coupons/apply`

Validate and apply a coupon code against a cart total.

**Auth Required:** No
**Aliases:** `POST /api/coupons/validate`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "code": "MEGA15",
  "cartAmount": 2000
}
```

**Success Response `200`:**
```json
{
  "valid": true,
  "success": true,
  "code": "MEGA15",
  "discountType": "percentage",
  "discountValue": 15,
  "discountAmount": 300,
  "payableAmount": 1700,
  "message": "🎉 Coupon 'MEGA15' applied successfully! You saved ₹300."
}
```

**Error Responses `400`:**
```json
{ "valid": false, "success": false, "message": "Coupon code 'XYZ' does not match" }
{ "valid": false, "success": false, "message": "Coupon code 'XYZ' is currently inactive" }
{ "valid": false, "success": false, "message": "Coupon 'MEGA15' requires a minimum order of ₹1,499. Add ₹499 more to avail!" }
```

---

### `GET /api/coupons`

Fetch all coupons for admin management. *(Admin only)*
**Aliases:** `GET /api/admin/coupons`
**Response `200`:** *(Array of all coupon objects, sorted newest first)*

---

### `POST /api/coupons`

Create a new coupon. *(Admin only)*
**Aliases:** `POST /api/admin/coupons`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "code": "FESTIVAL50",
  "discountType": "fixed",
  "discountAmount": 50,
  "maxDiscountAmount": 0,
  "minOrderAmount": 299,
  "description": "Flat ₹50 off on orders above ₹299",
  "isActive": true
}
```

**Response `201`:** *(New coupon object)*

---

### `PUT /api/coupons/:id`

Update a coupon. *(Admin only)*
**Aliases:** `PUT /api/admin/coupons/:id`
**URL Param:** `:id` — coupon `_id`
**Request Body:** *(Any subset of coupon fields)*
**Response `200`:** *(Updated coupon object)*

---

### `DELETE /api/coupons/:id`

Delete a coupon. *(Admin only)*
**Aliases:** `DELETE /api/admin/coupons/:id`

**Response `200`:**
```json
{ "success": true, "message": "Coupon deleted successfully" }
```

---
---

## 10. 🔔 Notifications

### `GET /api/notifications`

Fetch all notifications. **Public.**
**Aliases:** `/api/admin/notifications`, `/notifications`

**Response `200`:**
```json
[
  {
    "_id": "64notif...",
    "title": "🔥 Welcome to Dipto Fashion!",
    "message": "Explore our exclusive Banarasi sarees, Festive Kurta collections, and special discount offers!",
    "type": "Announcement",
    "target": "ALL",
    "readBy": ["64user1..."],
    "createdAt": "2026-08-01T00:00:00.000Z"
  }
]
```

---

### `POST /api/notifications`

Broadcast a new notification. *(Admin only)*
**Aliases:** `POST /api/admin/notifications`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "🎉 Independence Day Sale is LIVE!",
  "message": "Flat 30% OFF on all items. Offer valid till midnight only!",
  "type": "Announcement",
  "target": "ALL"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | — |
| `message` | string | ✅ | — |
| `type` | string | ❌ | Defaults to `"Announcement"` |
| `target` | string | ❌ | Defaults to `"ALL"` |

**Response `201`:**
```json
{
  "success": true,
  "message": "Saved to MongoDB",
  "notification": {}
}
```

---

### `POST /api/notifications/:id/read`

Mark a notification as read by a specific user.

**URL Param:** `:id` — notification `_id`
**Request Body:**
```json
{ "userId": "64user123..." }
```

**Response `200`:**
```json
{
  "success": true,
  "notification": {}
}
```

---

### `DELETE /api/notifications/:id`

Delete a notification. *(Admin only)*

**Response `200`:**
```json
{ "success": true, "message": "Notification deleted successfully" }
```

---

### `GET /api/notifications/stream`

Server-Sent Events (SSE) stream for real-time notifications.
> **Android Note:** Prefer **Socket.IO** over SSE for Android. SSE is primarily for web clients.

---
---

## 11. 🏷️ Live Sale Banner

### `GET /api/live-sale`

Fetch the current live sale banner configuration. **Public.**
**Aliases:** `/api/live-sale/active`, `/live-sale`

**Response `200`:**
```json
{
  "_id": "64sale...",
  "isActive": true,
  "title": "🔥 MEGA FESTIVE SALE IS LIVE!",
  "offerDetails": "Up to 50% OFF on Banarasi Sarees & Royal Kurtas",
  "targetCategory": "All",
  "endTime": "2026-08-11T02:57:00.000Z"
}
```

| Field | Description |
|---|---|
| `isActive` | Whether to display the banner in the app |
| `targetCategory` | Category to highlight. `"All"` = site-wide sale |
| `endTime` | ISO date string for countdown timer end time |

---

### `POST /api/admin/live-sale`

Update the live sale banner. *(Admin only)*
**Aliases:** `/api/live-sale`, `/admin/live-sale`

**Request Body:**
```json
{
  "isActive": true,
  "title": "🎉 Independence Day Sale!",
  "offerDetails": "Flat 30% OFF on ALL items today only!",
  "targetCategory": "Saree",
  "endTime": "2026-08-15T23:59:59.000Z"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Saved to MongoDB",
  "liveSale": {}
}
```

---
---

## 12. 📋 Support Reports / Tickets

### `POST /api/reports`

Submit a customer support ticket.

**Auth Required:** `Authorization: Bearer <token>` *(optional — `userEmail` can be passed in body instead)*
**Aliases:** `/api/admin/reports`, `/reports`
**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "subject": "Wrong item received",
  "category": "Order Issue",
  "message": "I ordered a blue saree but received a red one. Order ID: DF-123456.",
  "userEmail": "rahul@example.com",
  "userName": "Rahul Sharma"
}
```

| Field | Type | Required |
|---|---|---|
| `subject` | string | ✅ |
| `category` | string | ✅ |
| `message` | string | ✅ |
| `userEmail` | string | ✅ *(if no token)* |
| `userName` | string | ❌ |

**Response `201`:**
```json
{
  "success": true,
  "report": {
    "_id": "64rep...",
    "userId": "64user...",
    "userEmail": "rahul@example.com",
    "userName": "Rahul Sharma",
    "subject": "Wrong item received",
    "category": "Order Issue",
    "message": "I ordered a blue saree but received a red one.",
    "status": "Pending",
    "adminReply": "",
    "createdAt": "2026-08-10T02:00:00.000Z",
    "updatedAt": "2026-08-10T02:00:00.000Z"
  }
}
```

---

### `GET /api/reports/my-reports`

Fetch tickets submitted by the logged-in user.

**Auth Required:** `Authorization: Bearer <token>` *(or query param `?email=...`)*
**Aliases:** `GET /api/reports/user`

**Response `200`:** *(Array of report objects)*

---

### `GET /api/reports`

Fetch all support tickets. *(Admin only)*
**Aliases:** `GET /api/admin/reports`

**Response `200`:** *(Array of all report objects sorted by newest)*

---

### `PUT /api/reports/reply/:id`

Admin replies to a support ticket.

**URL Param:** `:id` — report `_id`
**Request Body:**
```json
{
  "adminReply": "We apologize for the inconvenience. A replacement will be sent within 3 business days.",
  "status": "Resolved"
}
```

| `status` | Description |
|---|---|
| `"Pending"` | Awaiting reply |
| `"Resolved"` | Issue resolved (default when admin replies) |

**Response `200`:**
```json
{
  "success": true,
  "report": {}
}
```

---

### `DELETE /api/reports/:id`

Delete a report ticket. *(Admin only)*

**Response `200`:**
```json
{ "success": true, "message": "Report deleted successfully" }
```

---
---

## 13. 📊 Admin Analytics & Billing

### `GET /api/admin/analytics`

Sales analytics and dashboard KPIs.

**Auth Required:** No *(convention restricted to admin)*
**Query Params:** `?startDate=2026-08-01&endDate=2026-08-10` *(optional ISO date range filter)*

**Response `200`:**
```json
{
  "todaySales": 12500,
  "monthlySales": 87500,
  "totalSales": 350000,
  "totalOrders": 120,
  "acceptedOrdersCount": 45,
  "pendingOrdersCount": 12,
  "dailyReturnQty": 1,
  "dailyReturnAmount": 2499,
  "monthlyReturnQty": 5,
  "monthlyReturnAmount": 9500,
  "pendingReturnsCount": 3,
  "pendingReturns": [],
  "chartData": [
    { "date": "2026-08-01", "sales": 5000 },
    { "date": "2026-08-02", "sales": 7500 }
  ],
  "returnChartData": [
    { "date": "2026-08-05", "returnQty": 2, "returnAmount": 4998 }
  ]
}
```

> `totalSales`, `todaySales`, `monthlySales` include only orders with status: `Accepted`, `Shipped`, `Out for Delivery`, or `Delivered`.

---

### `GET /api/admin/billing`

Financial ledger with credit/debit history.

**Auth Required:** No *(convention restricted to admin)*

**Response `200`:**
```json
{
  "totalCredit": 87500,
  "totalDebit": 9500,
  "netTotal": 78000,
  "totalEntries": 32,
  "ledger": [
    {
      "id": "64ord...",
      "date": "2026-08-10T10:00:00.000Z",
      "orderId": "DF-123456",
      "customerName": "Rahul Sharma",
      "utrNumber": "UTR123456789",
      "type": "credit",
      "sign": "+",
      "label": "Item Sold / Shipped",
      "amount": 4998,
      "status": "Shipped"
    },
    {
      "id": "64ord..._ret",
      "date": "2026-08-09T08:00:00.000Z",
      "orderId": "DF-123455",
      "customerName": "Priya Devi",
      "utrNumber": "UTR987654321",
      "type": "debit",
      "sign": "-",
      "label": "Order Return / Refund",
      "amount": -2499,
      "rawAmount": 2499,
      "status": "Refund Completed"
    }
  ]
}
```

---
---

## 14. 📡 Admin SSE Order Stream

### `GET /api/admin/order-stream`

Server-Sent Events stream for real-time new order notifications in admin panel.

> **Android Note:** For Android, use Socket.IO event `new_order_placed` instead.

---
---

## 🔢 HTTP Status Code Reference

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created successfully |
| `400` | Bad request / validation failed |
| `401` | Unauthorized — missing or invalid JWT token |
| `404` | Resource not found |
| `500` | Internal server error |

---
---

## 📌 Android Integration Quick Reference

### Authentication Flow
```
New User:       pre-check-signup  →  (Firebase OTP on client)  →  register
Returning User: login  →  store JWT  →  attach as "Authorization: Bearer <token>"
Forgot Password: (Firebase OTP on client)  →  reset-password
```

### UPI Order Flow
```
1. GET /api/products            → Browse products
2. GET /api/coupons/active      → Show available coupons
3. POST /api/coupons/apply      → Validate coupon code
4. POST /api/orders             → Place order with utrNumber
5. GET /api/user/my-orders      → Show order tracking history
6. POST /api/orders/:id/cancel  → Cancel if needed
```

### Razorpay Order Flow
```
1. POST /api/payment/create-order     → Get Razorpay order_id & key
2. Razorpay Android SDK Checkout      → User completes payment
3. POST /api/payment/verify-razorpay  → Verify & register order (auto status: "Accepted")
4. GET /api/user/my-orders            → Confirm in order history
```

### Key Implementation Notes

| Topic | Note |
|---|---|
| **Stock display** | Always read `remainingStock` (not `quantity`) for availability. `remainingStock <= 0` means out of stock. |
| **Out-of-stock field** | No `is_out_of_stock` field exists. Compute: `val isOutOfStock = remainingStock <= 0` |
| **Token storage** | Store JWT in Android Keystore or EncryptedSharedPreferences. Expires in 7 days. |
| **Token refresh** | Re-prompt login on `401` response. There is no refresh token endpoint. |
| **Images** | Each product has `image` (primary string) and `images` (full array). Use `images` for carousel. |
| **Socket.IO** | Connect at app startup. Listen for `order_status_updated` for push-style order tracking. |
| **Notification badge** | Check if `userId` is absent from `notification.readBy[]` to mark as unread. |
| **Coupon math** | `fixed`: `discount = discountAmount`. `percentage`: `discount = min(cartTotal × discountAmount / 100, maxDiscountAmount)`. Final: `max(0, cartTotal - discount)`. |
| **Order ID format** | Auto-generated IDs follow the pattern `DF-XXXXXX` (6-digit number). |
| **Price currency** | All price fields (`price`, `mrp`, `totalAmount`, `discountAmount`) are in **Indian Rupees (₹)**. |





TASK FOR REACT NATIVE APP:
Connect Web Backend APIs to React Native App based on the documentation above.

REQUIREMENT: 
The app is strictly for end-users/customers (Admin Panel UI is NOT present and should NOT be added).

PLEASE INTEGRATE THE FOLLOWING BACKEND APIs:

1. CENTRALIZE API MODULE (`src/services/api.ts`):
   - Set up Axios instance with Base URL.
   - Configure JWT Authorization header interceptor using `@react-native-async-storage/async-storage` for logged-in requests.

2. AUTH & USER PROFILE:
   - Connect login, registration, password reset, and user profile management (Name, Address CRUD).

3. PRODUCTS & DYNAMIC STOCK:
   - Fetch real product categories and products from `GET /api/products`.
   - Update `ProductDetailsScreen.tsx` to display real-time available stock count (`quantity` / `remainingStock`).
   - If stock <= 0, show "Out of Stock" and disable 'Add to Cart' / 'Buy Now'.

4. CART, COUPONS & ORDERS:
   - Apply coupon validation (`/api/coupons/apply`).
   - Connect real order placement endpoint (`POST /api/orders`) and fetch live order history / tracking steps.

5. RAZORPAY PAYMENT INTEGRATION:
   - Connect Razorpay order creation (`/api/payments/create-order`) and payment verification (`/api/payments/verify`) endpoints to `CheckoutScreen.tsx` using Live Key ID `rzp_live_TMnf64UYjTg87s`.

6. TYPESCRIPT CHECK:
   - Run `npx tsc --noEmit` upon completion to verify 0 TypeScript compilation errors.