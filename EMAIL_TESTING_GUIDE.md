# Testing Email Notifications - Quick Guide

## 🎯 Current Status: TEST MODE ENABLED

All emails are being routed to: **juncando@gmail.com**

This allows you to test the complete email flow before verifying a custom domain.

## 📧 What Emails Will You Receive?

When you make a test order, you'll receive **TWO emails** at juncando@gmail.com:

### 1. Customer Confirmation Email
- ✅ Subject: "Order Confirmation - ORD-XXXXXXX-XXX"
- Contains: Full order details, delivery address, itemized list
- Styled: Gold and black branding (customer-friendly)

### 2. Owner Notification Email
- 🔔 Subject: "🔔 NEW ORDER: ORD-XXXXXXX-XXX - €XX.XX"
- Contains: Customer contact info, order details, delivery instructions
- Styled: Red theme (urgent alert for restaurant owner)

Both emails will have a **yellow test mode banner** showing:
- ⚠️ TEST MODE indicator
- The real recipient email that would have received it in production

## 🧪 How to Test the Complete Flow

### Step 1: Make a Test Order
1. Go to: https://www.namastecurry.house/menu
2. Add items to cart (try different items, add spice levels)
3. Click "Checkout"

### Step 2: Fill in Customer Info
Use any test information:
- Name: Test Customer
- Email: test@example.com (doesn't matter, will go to juncando@gmail.com)
- Phone: +351 912 345 678

### Step 3: Add Delivery Address
- Street: Rua de São Paulo, 123
- Apartment: 2B
- City: Lisboa
- Postal Code: 1200-427
- Country: Portugal

### Step 4: Complete Payment
- Use test card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Name: Any name

### Step 5: Check Your Email
Check **juncando@gmail.com** inbox for:
- ✅ Customer confirmation email (pretty, gold theme)
- 🔔 Owner notification email (urgent, red theme)

### Step 6: Check Admin Dashboard
Go to: https://www.namastecurry.house/admin#orders
- Login with admin credentials
- You should see the new order
- WhatsApp link button available

## 📊 Monitoring

### Console Logs (Vercel)
Go to: https://vercel.com/quantumclimbs-projects/namastecurryhouse/logs

Look for these messages:
```
✅ Resend initialized for email notifications
⚠️  RESEND TEST MODE: All emails will be sent to juncando@gmail.com
✅ Checkout completed for order ORD-XXXXXXX-XXX
📱 WHATSAPP NOTIFICATION
✅ Customer confirmation email sent to juncando@gmail.com (TEST MODE)
   (Original recipient: test@example.com)
✅ Owner notification email sent to juncando@gmail.com (TEST MODE)
   (Original recipient: namastecurrylisboa@gmail.com)
```

### Resend Dashboard
Check sent emails: https://resend.com/emails
- You'll see both emails in the dashboard
- Can view email HTML and delivery status

## ⚙️ Test Mode Configuration

### Current Settings:
```
RESEND_TEST_MODE = true (hardcoded in server.js)
RESEND_TEST_EMAIL = juncando@gmail.com
```

### To Disable Test Mode Later (after domain verification):
Edit `server/index.js` line ~27:
```javascript
// Change from:
const RESEND_TEST_MODE = process.env.RESEND_TEST_MODE === 'true' || true;

// To:
const RESEND_TEST_MODE = process.env.RESEND_TEST_MODE === 'true' || false;
```

Or add to Vercel environment variables:
```
RESEND_TEST_MODE = false
```

## 🚀 Moving to Production

Once you're satisfied with testing:

### 1. Verify Domain
- Go to: https://resend.com/domains
- Add domain: namastecurry.house
- Add DNS records
- Wait for verification

### 2. Update Email Senders
Edit `server/index.js`:
```javascript
// Change from:
from: 'Namaste Curry House <onboarding@resend.dev>'

// To:
from: 'Namaste Curry House <orders@namastecurry.house>'
```

### 3. Disable Test Mode
Set `RESEND_TEST_MODE = false` in code or environment variable

### 4. Deploy
```bash
git add .
git commit -m "Disable test mode - use verified domain"
git push origin main
```

## ✅ What to Verify During Testing

- [ ] Both emails arrive at juncando@gmail.com
- [ ] Customer email shows correct order details
- [ ] Owner email shows customer contact info
- [ ] Delivery address is formatted correctly
- [ ] Order total matches what was paid
- [ ] Spice levels show correctly in emails
- [ ] Test mode banner appears in both emails
- [ ] WhatsApp notification logs in console
- [ ] Order appears in admin dashboard
- [ ] Stripe receipt also sent separately (from Stripe)

## 🐛 Troubleshooting

**No emails received?**
- Check spam folder in juncando@gmail.com
- Check Vercel logs for errors
- Check Resend dashboard for delivery status
- Verify RESEND_API_KEY is in Vercel env variables

**Only one email received?**
- Check Vercel logs for which email failed
- Look for error messages in logs
- Verify both functions are being called

**Emails look broken?**
- HTML should render properly in most email clients
- Try opening in Gmail, Outlook, or Apple Mail
- Check mobile rendering

---

**Status:** Ready for testing! 🎉
**Next:** Make a test order and check juncando@gmail.com
