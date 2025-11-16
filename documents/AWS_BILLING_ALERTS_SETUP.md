# AWS Billing Alerts Setup Guide

This guide will help you set up billing alerts in AWS Console to monitor your spending and avoid unexpected charges.

---

## Prerequisites

- AWS account with billing access
- Access to AWS Console (root account or IAM user with billing permissions)

---

## Step-by-Step Instructions

### Step 1: Enable Billing Alerts

1. **Log in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Sign in with your AWS account credentials

2. **Navigate to Billing Dashboard**
   - Click on your account name (top right)
   - Select "Billing Dashboard" from the dropdown menu
   - Or go directly to: https://console.aws.amazon.com/billing/

3. **Open Billing Preferences**
   - In the left sidebar, click on "Billing preferences"
   - Or go directly to: https://console.aws.amazon.com/billing/home#/preferences

4. **Enable Billing Alerts**
   - Scroll down to the "Billing alerts" section
   - Check the box: **"Receive Billing Alerts"**
   - Click **"Save preferences"**

---

### Step 2: Set Up CloudWatch Billing Alarm

Billing alerts use Amazon CloudWatch alarms. You need to create an alarm that monitors your estimated charges.

#### Option A: Using AWS Console (Recommended)

1. **Navigate to CloudWatch**
   - Go to: https://console.aws.amazon.com/cloudwatch/
   - Or search for "CloudWatch" in the AWS Console search bar

2. **Create Billing Alarm**
   - In the left sidebar, click **"Alarms"**
   - Click **"Create alarm"** button (or "All alarms" → "Create alarm")

3. **Select Metric**
   - Click **"Select metric"**
   - In the search box, type: **"Billing"**
   - Under "Metrics" → "Billing", select **"EstimatedCharges"**
   - Select the metric (usually shows "EstimatedCharges" with your account ID)
   - Click **"Select metric"**

4. **Configure Alarm**
   - **Alarm name:** `echo-dev-billing-alert` (or your preferred name)
   - **Alarm description:** `Alert when estimated charges exceed threshold`
   - **Threshold type:** Select **"Static"**
   - **Whenever EstimatedCharges is...:** Select **"Greater"**
   - **than...:** Enter your threshold amount (e.g., `50` for $50)
   - **Unit:** Select **"USD"**
   - **Period:** Select **"6 hours"** (billing data updates every 6 hours)
   - **Datapoints to alarm:** `1 out of 1`

5. **Configure Notification**
   - Under "Notification", select **"Create new SNS topic"**
   - **Topic name:** `echo-billing-alerts`
   - **Email addresses:** Enter your email address (comma-separated for multiple)
   - Click **"Create topic"**
   - AWS will send a confirmation email - **check your email and confirm the subscription**

6. **Create Alarm**
   - Review your settings
   - Click **"Create alarm"**

#### Option B: Using AWS CLI

If you prefer using the command line:

```bash
# Create SNS topic for billing alerts
aws sns create-topic --name echo-billing-alerts

# Subscribe your email to the topic
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:echo-billing-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# Create CloudWatch alarm
aws cloudwatch put-metric-alarm \
  --alarm-name echo-dev-billing-alert \
  --alarm-description "Alert when estimated charges exceed $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=Currency,Value=USD \
  --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:echo-billing-alerts
```

**Note:** Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID. You can find it in the top right of AWS Console.

---

## Recommended Alert Thresholds

For development environments, consider setting up multiple alerts:

1. **Warning Alert:** $25-50
   - Early warning to monitor spending
   - Helps catch unexpected usage early

2. **Critical Alert:** $100-200
   - Indicates significant spending
   - May require immediate investigation

3. **Budget Limit Alert:** Based on your monthly budget
   - Set to your expected monthly spend
   - Helps stay within budget

---

## Testing Your Alerts

1. **Verify Email Subscription**
   - Check your email inbox for AWS SNS confirmation
   - Click the confirmation link in the email

2. **Test Alarm (Optional)**
   - Temporarily lower your threshold to a very low value (e.g., $0.01)
   - Wait for the alarm to trigger (may take up to 6 hours)
   - Verify you receive the email notification
   - Reset the threshold to your desired value

---

## Monitoring Your Spending

### View Current Charges

1. Go to **Billing Dashboard**: https://console.aws.amazon.com/billing/
2. View **"Month-to-Date"** charges
3. Check **"Cost Explorer"** for detailed breakdowns

### Set Up Budgets (Advanced)

For more advanced spending control:

1. Go to **AWS Budgets**: https://console.aws.amazon.com/billing/home#/budgets
2. Click **"Create budget"**
3. Choose budget type:
   - **Cost budget** - Track spending
   - **Usage budget** - Track usage of specific services
   - **RI utilization budget** - Track Reserved Instance usage
4. Configure thresholds and alerts
5. Set up notifications

---

## Important Notes

### Billing Data Updates
- Billing data updates approximately every **6 hours**
- Alarms check every 6 hours, so there may be a delay
- Actual charges may differ slightly from estimates

### Free Tier Monitoring
- AWS Free Tier includes 10 CloudWatch alarms free
- After free tier, alarms cost ~$0.10 per alarm per month
- SNS email notifications are free

### Account Permissions
- Root account has full billing access
- IAM users need `aws-portal:ViewBilling` permission
- IAM users need `cloudwatch:PutMetricAlarm` permission

### Multiple Accounts
- If you have multiple AWS accounts, set up alerts for each
- Consider using AWS Organizations for consolidated billing

---

## Troubleshooting

### Alarm Not Triggering
- Check that billing alerts are enabled in Billing Preferences
- Verify SNS topic subscription is confirmed (check email)
- Ensure threshold is set correctly
- Wait up to 6 hours for billing data to update

### Not Receiving Emails
- Check spam/junk folder
- Verify email subscription is confirmed in SNS
- Check SNS topic configuration
- Ensure email address is correct

### Permission Errors
- Ensure IAM user has billing permissions
- Check CloudWatch permissions
- Verify SNS permissions

---

## Additional Resources

- **AWS Billing Dashboard**: https://console.aws.amazon.com/billing/
- **CloudWatch Alarms**: https://console.aws.amazon.com/cloudwatch/
- **AWS Budgets**: https://console.aws.amazon.com/billing/home#/budgets
- **AWS Documentation**: https://docs.aws.amazon.com/awsaccountbilling/

---

## Quick Checklist

- [ ] Enable billing alerts in Billing Preferences
- [ ] Create CloudWatch alarm for estimated charges
- [ ] Set up SNS topic for notifications
- [ ] Confirm email subscription
- [ ] Test alarm (optional)
- [ ] Set appropriate threshold ($50 recommended for dev)
- [ ] Monitor spending regularly

---

**Status:** ✅ Ready to configure

Once completed, update the Pre-Implementation Checklist:
- [x] Set up billing alerts in AWS Console

