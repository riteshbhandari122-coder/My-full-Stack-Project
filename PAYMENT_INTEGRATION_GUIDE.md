# eSewa & Khalti Sandbox Payment Integration Guide

This document explains the complete integration of **eSewa Sandbox** and **Khalti Sandbox** payment into your existing e-commerce website. Your existing UI design, CSS, products, cart system, and authentication remain **unchanged**.

---

## 1. Files Modified

| # | File | What Changed |
|---|------|--------------|
| 1 | `backend/controllers/paymentController.js` | Replaced live URLs with **sandbox** URLs, added `initiateEsewaPayment` & `initiateKhaltiPayment`, integrated the `Payment` model, and save transaction details on success. |
| 2 | `backend/routes/paymentRoutes.js` | Added two new routes: `POST /esewa/initiate` and `POST /khalti/initiate`. |
| 3 | `backend/.env` | Added eSewa sandbox credentials and Khalti sandbox key placeholders. |
| 4 | `frontend/src/pages/CheckoutPage.js` | Added `handleEsewaPayment` handler, fixed `handleKhaltiPayment` to use the new return URL, and added an eSewa info box (UI unchanged). |
| 5 | `frontend/src/App.js` | Imported `PaymentResponsePage` and added two routes: `/payment-response/esewa` and `/payment-response/khalti`. |

## 2. New Files Created

| # | File | Purpose |
|---|------|---------|
| 1 | `backend/models/Payment.js` | New **Payment** collection (paymentId, orderId, userId, paymentMethod, amount, transactionId, paymentStatus, createdAt). |
| 2 | `frontend/src/pages/PaymentResponsePage.js` | Receives the redirect back from eSewa/Khalti sandbox, calls the verify API, and shows success/failure UI. |

---

## 3. Database: Payment Collection

The new `Payment` model stores transaction details:

```js
{
  paymentId: String,        // unique internal ID (ESW_... / KLT_...)
  orderId: ObjectId,        // ref: Order
  userId: ObjectId,         // ref: User
  paymentMethod: String,    // 'esewa' | 'khalti'
  amount: Number,           // total paid
  transactionId: String,    // gateway reference (eSewa refId / Khalti pidx)
  paymentStatus: String,    // 'pending' | 'success' | 'failed' | 'cancelled'
  createdAt: Date,          // auto (timestamps: true)
}
```

### What is NOT stored (per your requirement)
- ❌ eSewa PIN
- ❌ Khalti PIN
- ❌ User wallet password
- ❌ OTP

These are never sent to your server — they are entered directly on the eSewa/Khalti hosted sandbox pages.

---

## 4. Where to Add API Keys & Sandbox Credentials

Open **`backend/.env`** and set these values:

```env
# eSewa Sandbox
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SANDBOX_URL=https://uat.esewa.com.np/epay/main
ESEWA_SANDBOX_VERIFY_URL=https://uat.esewa.com.np/epay/transrec

# Khalti Sandbox
KHALTI_SECRET_KEY=test_secret_key_your_khalti_test_secret_key
KHALTI_PUBLIC_KEY=test_public_key_your_khalti_test_public_key
```

### eSewa Sandbox Credentials
- **Merchant ID:** `EPAYTEST` (this is the public sandbox merchant code — already set).
- No secret key is required for eSewa sandbox; verification uses the merchant code + transaction reference.
- Sandbox URLs (already hardcoded in the controller):
  - Initiate: `https://uat.esewa.com.np/epay/main`
  - Verify: `https://uat.esewa.com.np/epay/transrec`

### Khalti Sandbox Credentials
1. Go to **https://merchant.khalti.com/** and log in (or register).
2. Switch to **Test Mode** (top right toggle).
3. Go to **Settings → Keys**.
4. Copy your **Test Secret Key** (starts with `test_secret_key_`).
5. Paste it into `KHALTI_SECRET_KEY` in `backend/.env`.
6. (Optional) Copy the **Test Public Key** into `KHALTI_PUBLIC_KEY`.

> ⚠️ Never commit real `.env` values to git. The `.env` file is already in `.gitignore`.

---

## 5. Payment Flow (How It Works)

### eSewa Sandbox Flow
```
User selects eSewa → Place Order
   ↓
Frontend: POST /api/payment/esewa/initiate { orderId, amount, returnUrl }
   ↓
Backend: creates Payment record (pending), builds eSewa sandbox URL
   ↓
Frontend: redirects to https://uat.esewa.com.np/epay/main?...
   ↓
User pays on eSewa sandbox page (enters eSewa ID + PIN there)
   ↓
eSewa redirects back to: /payment-response/esewa?oid=...&amt=...&refId=...
   ↓
PaymentResponsePage: POST /api/payment/esewa/verify { oid, amt, refId }
   ↓
Backend: calls eSewa transrec API → checks <response_code>Success</response_code>
   ↓
Updates Payment.status = 'success', Order.isPaid = true, Order.status = 'confirmed'
   ↓
Shows success screen with transaction ID
```

### Khalti Sandbox Flow
```
User selects Khalti → Place Order
   ↓
Frontend: POST /api/payment/khalti/initiate { orderId, amount, returnUrl }
   ↓
Backend: creates Payment record (pending), calls Khalti initiate API
   ↓
Frontend: redirects to Khalti payment_url
   ↓
User pays on Khalti sandbox page (mobile banking / Khalti wallet)
   ↓
Khalti redirects back to: /payment-response/khalti?pidx=...&status=...
   ↓
PaymentResponsePage: POST /api/payment/khalti/verify { pidx, orderId }
   ↓
Backend: calls Khalti lookup API → checks status === 'Completed'
   ↓
Updates Payment.status = 'success', Order.isPaid = true, Order.status = 'confirmed'
   ↓
Shows success screen with transaction ID
```

---

## 6. How to Test Sandbox Payment

### Step 1: Start the backend
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`.

### Step 2: Start the frontend
```bash
cd frontend
npm start
```
App runs on `http://localhost:3000`.

### Step 3: Test eSewa Sandbox
1. Add products to cart, go to **Checkout**.
2. Select **eSewa** as payment method.
3. Click **Place Order**.
4. You will be redirected to the **eSewa Sandbox** page (`uat.esewa.com.np`).
5. Use these **eSewa sandbox test credentials**:
   - **eSewa ID:** `9806800001` / `9806800002` / `9806800003` / `9806800004` / `9806800005`
   - **Password:** `Test@123` (or any valid sandbox password shown on the page)
   - **OTP:** `1234` (sandbox OTP)
6. Complete the payment.
7. You will be redirected back to `/payment-response/esewa`.
8. The app verifies the payment and shows **"Payment Successful! 🎉"**.
9. Check MongoDB — the `Payment` collection has a new document with `paymentStatus: 'success'`, and the `Order` has `isPaid: true`.

### Step 4: Test Khalti Sandbox
1. Add products to cart, go to **Checkout**.
2. Select **Khalti** as payment method.
3. Click **Place Order**.
4. You will be redirected to the **Khalti Sandbox** payment page.
5. Use these **Khalti sandbox test options**:
   - **Mobile Banking:** Choose a test bank (e.g., Nepal Bank) and follow the test flow.
   - **Khalti Wallet:** Use test wallet credentials from Khalti's test dashboard.
   - **ConnectIPS / E-Banking:** Also available in sandbox.
6. Complete the payment.
7. You will be redirected back to `/payment-response/khalti`.
8. The app verifies via Khalti lookup API and shows **"Payment Successful! 🎉"**.
9. Check MongoDB — the `Payment` collection has a new document with `paymentStatus: 'success'`, and the `Order` has `isPaid: true`.

### Step 5: Test Failure Flow
- On the eSewa sandbox page, click **"Cancel"** or enter wrong credentials.
- You will be redirected back to `/payment-response/esewa?status=failure`.
- The app shows **"Payment Failed"** with a link to retry from the orders page.
- The `Payment` record is marked `paymentStatus: 'failed'`, and the order remains unpaid.

---

## 7. API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/payment/esewa/initiate` | ✅ | Generate eSewa sandbox payment URL |
| POST | `/api/payment/esewa/verify` | ✅ | Verify eSewa transaction |
| POST | `/api/payment/khalti/initiate` | ✅ | Generate Khalti sandbox payment URL |
| POST | `/api/payment/khalti/verify` | ✅ | Verify Khalti transaction |
| POST | `/api/payment/cod` | ✅ | Cash on Delivery (unchanged) |
| POST | `/api/payment/stripe/intent` | ✅ | Stripe (unchanged) |

---

## 8. Going Live (Production)

When ready to accept real payments:

### eSewa
1. Register at **https://esewa.com.np** for a merchant account.
2. Get your production **Merchant ID**.
3. Change `ESEWA_MERCHANT_ID` in `.env` to your real merchant code.
4. In `paymentController.js`, change the URLs from `uat.esewa.com.np` to `esewa.com.np`.

### Khalti
1. Switch your Khalti merchant dashboard from **Test** to **Live**.
2. Copy your **Live Secret Key** (starts with `live_secret_key_`).
3. Replace `KHALTI_SECRET_KEY` in `.env` with the live key.
4. The Khalti API URLs (`a.khalti.com`) are the same for test and live — only the key changes.

---

## 9. Security Notes

- ✅ eSewa PIN, Khalti PIN, wallet passwords, and OTP are **never** sent to your server.
- ✅ Payment verification happens **server-side** by calling the gateway's verify API.
- ✅ Order status is only updated to "Paid" after successful server-side verification.
- ✅ The `Payment` model provides a full audit trail of every transaction.
- ✅ All payment routes are protected by the `protect` middleware (requires login).