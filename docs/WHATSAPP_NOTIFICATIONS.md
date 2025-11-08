# WhatsApp Notification Setup Guide

## Overview
The system now logs WhatsApp-formatted order notifications to the console with clickable links. When an order is completed, you'll see the notification in Vercel logs.

## Quick Setup

### 1. Add Environment Variable to Vercel

1. Go to: https://vercel.com/dashboard
2. Select project: **namastecurryhouse**
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `RESTAURANT_WHATSAPP`
   - **Value**: `+351920617185`
   - **Environment**: Production, Preview, Development (check all)
5. Click **Save**
6. Redeploy the application

### 2. How It Works

When a customer completes a payment:

1. **Stripe webhook fires** → `payment_intent.succeeded`
2. **Order status updated** → CONFIRMED
3. **WhatsApp notification logged** to Vercel console with:
   - Formatted order details
   - Customer info
   - Delivery address
   - Items with spice levels
   - Total amount
4. **Clickable WhatsApp link** provided in logs

## Notification Format

```
🔔 *NEW ORDER - ORD-20251108-456*

👤 *Customer:* John Doe
📞 *Phone:* +351912345678
📧 *Email:* john@example.com

📦 *Items:*
• 2x Butter Chicken (€25.98) - 50% spice
• 3x Garlic Naan (€7.50)

💰 *Subtotal:* €33.48
🚚 *Delivery:* €2.50
💳 *Total:* €35.98

📍 *Delivery Address:*
Rua Test 123, Lisbon, 1000-001

💳 *Payment:* Card (PAID ✅)
📊 *Status:* CONFIRMED
```

## Viewing Notifications

### Option 1: Vercel Logs (Current Implementation)
1. Go to Vercel Dashboard → namastecurryhouse
2. Click **Deployments** → Latest deployment
3. Click **View Function Logs**
4. Look for entries with 📱 WhatsApp notifications
5. Click the `wa.me` link to send via WhatsApp Web

### Option 2: API Endpoint
You can also get the WhatsApp link for any order via API:

```bash
GET /api/orders/{orderId}/whatsapp-link
```

**Response:**
```json
{
  "orderId": 123,
  "orderNumber": "ORD-20251108-456",
  "whatsappLink": "https://wa.me/351920617185?text=...",
  "message": "🔔 NEW ORDER...",
  "restaurantWhatsApp": "+351920617185"
}
```

## Testing

### Test Locally
```bash
node test-whatsapp-notifications.mjs
```

This will:
1. Create a test order
2. Generate WhatsApp notification
3. Display formatted message
4. Provide clickable link

### Test on Production
1. Go to https://www.namastecurry.house
2. Add items to cart
3. Go to checkout
4. Complete payment with test card: `4242 4242 4242 4242`
5. Check Vercel logs for WhatsApp notification

## Upgrade Options

### Option A: Automatic WhatsApp Sending (Twilio)
**Cost:** ~$0.005 per message

1. Sign up at: https://www.twilio.com/whatsapp
2. Get WhatsApp-enabled phone number
3. Add environment variables:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```
4. Install Twilio SDK: `npm install twilio`
5. Update `logWhatsAppNotification()` to use Twilio API

### Option B: WhatsApp Business API
**Cost:** Varies, requires business verification

1. Apply at: https://business.whatsapp.com/products/business-platform
2. Complete business verification
3. Get API credentials
4. Integrate with webhook system

### Option C: Keep Current (Manual Click)
**Cost:** Free

- Staff opens Vercel logs
- Clicks WhatsApp link when order comes in
- Message auto-populates in WhatsApp Web
- One click to send

## Current Advantages

✅ **Zero cost** - No API fees
✅ **No verification needed** - Works immediately  
✅ **Simple setup** - Just environment variable
✅ **Flexible** - Staff can edit message before sending
✅ **Reliable** - No API rate limits or outages

## Troubleshooting

### Notifications not appearing
1. Check Vercel environment variable is set
2. Verify webhook is receiving events
3. Check Function logs in Vercel dashboard

### WhatsApp link not working
1. Ensure phone number format: `+351920617185` (no spaces)
2. Check URL encoding is correct
3. Test link directly in browser

### Want to test without real payment
1. Use the API endpoint directly
2. Query existing order by ID
3. Get WhatsApp link for that order

## Next Steps

After deployment completes:
1. Make a test order on the live site
2. Complete payment
3. Check Vercel logs → Functions
4. Find the WhatsApp notification
5. Click the link to send to restaurant

---

**Note:** To enable automatic sending, implement Twilio or WhatsApp Business API. Current system requires manual click but is free and immediate.
