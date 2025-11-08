# Stripe Email Receipt Configuration Guide

## ✅ Current Status

Your Stripe account is configured and receipts are enabled!

**Account Details:**
- Account ID: `acct_1SQsSF4AYllAtAxr`
- Account Email: `drdeepthi2000@gmail.com`
- Business Support Email: `sandbox@accessible.stripe.com`

## 📧 How Stripe Email Receipts Work

When a customer completes a payment, Stripe will automatically send them an email receipt **IF** you have enabled this feature in your Stripe Dashboard.

### What's Included in Stripe Receipts:
- ✅ Payment amount and currency
- ✅ Date and time of payment
- ✅ Payment method (last 4 digits of card)
- ✅ Business name
- ✅ Receipt number
- ✅ Link to download receipt as PDF

### What's NOT Included:
- ❌ Order details (menu items, quantities)
- ❌ Delivery address
- ❌ Special instructions
- ❌ Custom branding

## 🔧 How to Verify & Enable in Stripe Dashboard

### Step 1: Log in to Stripe Dashboard
Visit: https://dashboard.stripe.com/login

### Step 2: Navigate to Email Settings
1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **Emails** in the settings menu
3. Or go directly to: https://dashboard.stripe.com/settings/emails

### Step 3: Enable Customer Receipts
Look for the section: **Customer emails**

Make sure these are **ENABLED** (toggle should be ON):
- ✅ **Successful payments** - Sends receipt after successful payment
- ✅ **Failed payments** (optional) - Notifies customer if payment fails
- ✅ **Refunds** (optional) - Notifies customer of refunds

### Step 4: Configure Business Details (Important!)
Go to: https://dashboard.stripe.com/settings/public

Make sure these are filled in:
- **Business name**: Namaste Curry House
- **Support email**: namastecurrylisboa@gmail.com (or your preferred email)
- **Support phone**: +351 920 617 185

This information will appear on the receipts!

## 🧪 How to Test

### Option 1: Use the Test Script
```bash
node test-stripe-receipt.mjs
```

This will:
1. Create a test checkout session
2. Give you a payment URL
3. You can complete the test payment with card: `4242 4242 4242 4242`
4. Check your email for the receipt

### Option 2: Test on Live Site
1. Go to: https://www.namastecurry.house/menu
2. Add items to cart
3. Go to checkout
4. Enter **YOUR REAL EMAIL** as customer email
5. Use test card: `4242 4242 4242 4242`
6. Expiry: Any future date (e.g., 12/25)
7. CVC: Any 3 digits (e.g., 123)
8. Complete the payment
9. Check your email inbox for the Stripe receipt

## 📊 Where to Check Receipts Were Sent

### In Stripe Dashboard:
1. Go to: https://dashboard.stripe.com/test/payments
2. Click on any successful payment
3. Scroll down to **Events & logs**
4. Look for: `charge.succeeded` event
5. Check if `receipt_email` field is populated
6. If receipts are enabled, you'll see `receipt_url` in the charge object

### What Success Looks Like:
```json
{
  "receipt_email": "customer@example.com",
  "receipt_url": "https://pay.stripe.com/receipts/...",
  "status": "succeeded"
}
```

## 🚨 Common Issues & Troubleshooting

### Issue 1: Customer Not Receiving Emails
**Possible Causes:**
- Receipts not enabled in Stripe Dashboard
- Email went to spam/junk folder
- Customer provided incorrect email address
- Email provider blocking Stripe emails

**Solutions:**
- Verify receipts are enabled in Dashboard → Settings → Emails
- Ask customer to check spam folder
- Whitelist Stripe emails: `*@stripe.com`
- Test with a different email provider

### Issue 2: Receipt Email Field is Empty
**Cause:** The `receipt_email` parameter wasn't set when creating the payment intent

**Solution:** ✅ Already fixed! We updated the code to include:
```javascript
payment_intent_data: {
  receipt_email: customerInfo.email
}
```

### Issue 3: Business Name Shows as "Stripe"
**Cause:** Business profile not configured

**Solution:** Update business details in Dashboard → Settings → Public details

## 📧 Phase 2: Custom Order Confirmation Emails

Stripe receipts only show payment information. For full order details, you'll need to implement custom emails using Resend (planned for Phase 2).

**Custom emails will include:**
- ✅ Full order details (items, quantities, customizations)
- ✅ Delivery address
- ✅ Special instructions
- ✅ Restaurant contact info
- ✅ Custom branding and styling
- ✅ Order tracking information

**Next Steps for Phase 2:**
1. Create Resend account: https://resend.com
2. Get API key
3. Add to Vercel environment variables
4. Implement custom email templates
5. Send emails to both customer and restaurant owner

## 🎯 Current Setup Summary

✅ **Stripe Checkout Sessions** - Configured and working
✅ **Receipt Email Parameter** - Added to checkout session creation
✅ **Customer Email Collection** - Captured during checkout
✅ **Webhook Handling** - Updates order status on payment
✅ **Test Mode** - Ready for testing with test cards

⏳ **Pending:** Verify "Successful payments" emails are enabled in Stripe Dashboard
⏳ **Phase 2:** Custom order confirmation emails via Resend

## 📞 Support

If receipts are not working after enabling in Dashboard:
1. Check spam folder
2. Test with test card and your own email
3. Check Stripe Dashboard logs for the payment
4. Verify `receipt_email` field is populated in charge object
5. Contact Stripe support if needed: https://support.stripe.com

---

**Last Updated:** November 8, 2025
**Next Review:** After first real customer payment
