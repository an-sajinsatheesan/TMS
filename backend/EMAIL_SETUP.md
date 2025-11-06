# Email Setup Guide for TaskCRM

## Gmail Configuration for Development

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other" as the device and name it "TaskCRM Backend"
4. Click "Generate"
5. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Update .env File
Open your `.env` file and update these values:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # Paste the app password here (no spaces)
EMAIL_FROM=TaskCRM <your-email@gmail.com>
```

**Example:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=an.sajinsatheesan@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=TaskCRM <an.sajinsatheesan@gmail.com>
```

### Step 4: Restart Your Server
```bash
npm run dev
```

### Step 5: Test OTP Email
Try registering a new account or requesting an OTP. You should receive an email within seconds!

## Troubleshooting

### "Invalid login" error
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Factor Authentication is enabled
- Double-check there are no extra spaces in the password

### "Connection timeout"
- Check your internet connection
- Try using port 465 with `secure: true` in the transporter config
- Check if your firewall is blocking SMTP connections

### Still seeing console logs?
- The service will fall back to console logging if email sending fails
- Check the error message in your terminal for specific issues

## Alternative Email Services (For Production)

For production, consider these alternatives:

1. **SendGrid** - Free tier: 100 emails/day
2. **AWS SES** - Pay as you go, very cheap
3. **Resend** - Developer-friendly, modern API
4. **Mailgun** - Free tier: 5,000 emails/month

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables in production
- Rotate app passwords regularly
- Consider using a dedicated email service for production
