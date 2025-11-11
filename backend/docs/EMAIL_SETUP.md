# Email Configuration Guide

## Overview

The application uses **Nodemailer** to send transactional emails for:
- ✉️ OTP codes for email verification
- 📧 Invitation emails for workspace/project invitations
- 🔑 Password reset links
- 👋 Welcome emails

## Development Mode

In **development mode**, if email configuration is missing or fails, the system will:
- ✅ Continue to work (won't throw errors)
- 📝 Log email content to console
- 🔗 Display invitation URLs in terminal for testing

### Console Output Example:
```
========== INVITATION EMAIL FALLBACK ==========
To: user@example.com
From: John Doe
Workspace/Project: Acme Corp
Invitation Link: http://localhost:3002/accept-invitation/abc-123-xyz
===============================================
```

## Production Setup

### Required Environment Variables

Add these to your `.env` file:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=TaskCRM <noreply@taskcrm.com>

# Frontend URL (for invitation links)
CLIENT_URL=http://localhost:3002
```

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Security → 2-Step Verification → Turn On

2. **Create App-Specific Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "TaskCRM Backend"
   - Copy the 16-character password
   - Use this as `EMAIL_PASSWORD` in .env

3. **Update .env file**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # The 16-char password from step 2
   ```

### Alternative SMTP Providers

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASSWORD=your-mailgun-smtp-password
EMAIL_FROM=noreply@yourdomain.com
```

#### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-smtp-username
EMAIL_PASSWORD=your-aws-smtp-password
EMAIL_FROM=noreply@yourdomain.com
```

## Testing Email Configuration

### 1. Start Backend Server
```bash
cd backend
npm start
```

### 2. Test OTP Email (Registration)
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Check Console or Email
- **Development**: Check console for OTP code
- **Production**: Check email inbox for OTP

### 4. Test Invitation Email
1. Create a workspace
2. Invite a user via the UI or API
3. Check console/email for invitation link

## Troubleshooting

### Issue: "Failed to send email"

**Solutions:**
1. ✅ Verify Gmail App Password is correct (16 characters, no spaces)
2. ✅ Check 2FA is enabled on Google Account
3. ✅ Ensure `EMAIL_USER` matches the Gmail account
4. ✅ Try regenerating App Password
5. ✅ Check firewall/network allows SMTP port 587

### Issue: "Less secure app access"

**Solution:**
- ❌ Don't use "Less secure app access" (deprecated)
- ✅ Use App-Specific Password instead (see setup above)

### Issue: "No .env file"

**Solution:**
```bash
cd backend
cp .env.example .env
# Edit .env with your actual credentials
```

### Issue: Emails go to Spam

**Solutions:**
1. Use a custom domain instead of Gmail
2. Set up SPF, DKIM, and DMARC records
3. Use a dedicated email service (SendGrid, Mailgun, etc.)
4. Verify sender email address

## Email Templates

Email templates are defined in `backend/services/email.service.js`:
- `sendOtpEmail()` - OTP verification
- `sendInvitationEmail()` - Workspace/project invitations
- `sendWelcomeEmail()` - New user welcome
- `sendPasswordResetEmail()` - Password reset

### Customizing Templates

Edit the HTML in each method:
```javascript
// backend/services/email.service.js
static async sendInvitationEmail(email, tenantName, inviterName, token) {
  // Modify the HTML template here
  html: `
    <!DOCTYPE html>
    <html>
      <!-- Your custom HTML -->
    </html>
  `
}
```

## Security Best Practices

1. **Never commit .env** - Already in .gitignore
2. **Use App Passwords** - Never use main Gmail password
3. **Rotate credentials** - Change passwords periodically
4. **Monitor usage** - Check for unusual sending patterns
5. **Rate limiting** - Implement email rate limits in production

## Production Checklist

- [ ] Email credentials configured in .env
- [ ] Test OTP emails work
- [ ] Test invitation emails work
- [ ] CLIENT_URL points to production domain
- [ ] EMAIL_FROM uses your domain (not Gmail)
- [ ] SPF/DKIM/DMARC configured for custom domain
- [ ] Email rate limiting enabled
- [ ] Error monitoring set up (Sentry, etc.)

## Support

If you continue to have issues:
1. Check server logs: `npm start` and watch console
2. Verify environment variables are loaded
3. Test SMTP connection with a tool like https://www.smtper.net/
4. Check Gmail account activity for blocked sign-in attempts

---

**Need Help?** See main documentation or open an issue on GitHub.
