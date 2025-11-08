# Adding RESEND_API_KEY to Vercel - Quick Guide

## Step 1: Go to Vercel Dashboard
Visit: https://vercel.com/quantumclimbs-projects/namastecurryhouse/settings/environment-variables

Or:
1. Go to https://vercel.com
2. Select "namastecurryhouse" project
3. Click "Settings" tab
4. Click "Environment Variables" in the left sidebar

## Step 2: Add the RESEND_API_KEY

Click "Add New" and enter:

**Key:**
```
RESEND_API_KEY
```

**Value:**
```
re_RQ7rkjqb_JnHWycSWfxxKnSAqFo2m7Rcj
```

**Environments:** Select all three:
- ✅ Production
- ✅ Preview
- ✅ Development

Click "Save"

## Step 3: Add RESTAURANT_EMAIL (if not already there)

Click "Add New" again and enter:

**Key:**
```
RESTAURANT_EMAIL
```

**Value:**
```
namastecurrylisboa@gmail.com
```

**Environments:** Select all three:
- ✅ Production
- ✅ Preview
- ✅ Development

Click "Save"

## Step 4: Redeploy

After adding the environment variables, you need to trigger a new deployment:

### Option A: Automatic (Recommended)
The latest code push will automatically trigger a deployment.
Wait 2-3 minutes for Vercel to deploy.

### Option B: Manual
1. Go to "Deployments" tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"

## Step 5: Verify Email Configuration

Once deployed, test the email functionality:

### Test with Real Order:
1. Go to https://www.namastecurry.house/menu
2. Add items to cart
3. Go to checkout
4. Enter YOUR email as customer email
5. Use test card: 4242 4242 4242 4242
6. Complete payment

### Check Results:
- ✅ Customer should receive: Order confirmation email
- ✅ Owner should receive: New order notification email at namastecurrylisboa@gmail.com
- ✅ Console should show: WhatsApp notification with link

## Important Notes

### Resend Email Sender
Currently using: `onboarding@resend.dev`

**For Production:**
You should verify your own domain with Resend:
1. Go to https://resend.com/domains
2. Add your domain (e.g., namastecurry.house)
3. Add DNS records (they'll provide these)
4. Update the `from` field in server code to use your domain

**Example after domain verification:**
```javascript
from: 'Namaste Curry House <orders@namastecurry.house>'
```

### Email Templates Include:
**Customer Email:**
- Order confirmation with order number
- Full itemized order details with spice levels
- Delivery address
- Total amount paid
- Expected delivery time
- Contact information

**Owner Email:**
- New order alert (red theme for urgency)
- Customer contact info (phone, email)
- Full order details
- Delivery address and instructions
- Payment confirmation
- Link to admin dashboard

### Troubleshooting

**Emails not arriving?**
1. Check Vercel logs: https://vercel.com/quantumclimbs-projects/namastecurryhouse/logs
2. Check spam folder
3. Verify RESEND_API_KEY is correct
4. Check Resend dashboard: https://resend.com/emails

**Check Resend Dashboard:**
https://resend.com/emails - Shows all sent emails and delivery status

**Console Errors:**
Look for these messages in Vercel logs:
- ✅ "Resend initialized for email notifications" (good)
- ✅ "Customer confirmation email sent" (good)
- ✅ "Owner notification email sent" (good)
- ❌ "Resend not configured" (means env variable missing)
- ❌ "Error sending customer email" (check Resend API key)

---

**Status:** Ready to deploy after environment variables are added
**Next:** Test with real order and verify emails arrive
