# Instagram Setup Guide

## Connect Facebook Page to Instagram

- Go to [facebook business](https://business.facebook.com/latest/home)
- In the sidebar, make sure your page is selected in drop down e.g. `Pizzahut Page`
- Click `Home` in sidebar
- Click [Connect Instagram](https://business.facebook.com/latest/home?nav_ref=bm_home_redirect&asset_id=113949078473999) link in the right pane top
- Click `Continue` button to connect Facebook page to Instagram account  

## Set Permissions

- In [Dashboard](https://developers.facebook.com/apps/your-app-id-here/dashboard) sidebar click [Use cases](https://developers.facebook.com/apps/your-app-id-here/use_cases)
  - Select `Manage messaging & content on Instagram`
    - Click `Add` for following to add required permission:
    - `business_management`
    - `instagram_basic`
    - `instagram_content_publish`
    - `pages_read_engagement`

## Prerequisites

1. **Instagram Business Account**: Your Instagram account must be converted to a Business Account
2. **Facebook Developer Account**: You need a Facebook Developer account
3. **Facebook App**: Create a Facebook app in the Facebook Developer Console
4. **Instagram Basic Display API**: Enable the Instagram Basic Display API in your Facebook app

## Getting Your Instagram Business Account ID

### Method 1: Using Facebook Business Manager

1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to **Business Settings** > **Instagram accounts**
3. Find your Instagram account in the list
4. The Instagram Business Account ID will be displayed (it's a numeric value)

### Method 2: Using Graph API Explorer

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Generate an access token with `instagram_basic` and `instagram_content_publish` permissions
4. Make a GET request to: `https://graph.facebook.com/v23.0/me/accounts`
5. Look for the Instagram account in the response - the ID will be the Instagram Business Account ID

### Method 3: Using Instagram API

1. Make a GET request to: `https://graph.facebook.com/v23.0/me/accounts?access_token=YOUR_ACCESS_TOKEN`
2. In the response, find the Instagram account and note the `instagram_business_account` ID

## Configuration

Update your settings.json file with the correct Instagram Business Account ID:

```json
{
  "id": "instagram:userId",
  "description": "instagram:userId", 
  "value": "YOUR_NUMERIC_INSTAGRAM_BUSINESS_ACCOUNT_ID"
}
```

**Important**: The userId must be a numeric value, not a username. For example:

- ✅ Correct: `"123456789012345"`
- ❌ Incorrect: `"seawingai"` or `"your_username"`

## Testing Your Configuration

You can test your Instagram configuration using the `testConfiguration()` method:

```typescript
const instagramPlatform = new InstagramPlatform(config);
await instagramPlatform.testConfiguration();
```

## Common Issues

### Error: "Instagram user ID must be a numeric ID, not a username"

- **Solution**: Use your Instagram Business Account ID (numeric) instead of your username
- **How to find it**: Follow the methods above to get your Instagram Business Account ID

### Error: "Instagram API 400 error"

- **Possible causes**:
  - Invalid Instagram Business Account ID
  - Expired or invalid access token
  - Missing required permissions
- **Solutions**:
  1. Verify your Instagram Business Account ID is correct
  2. Generate a new access token with proper permissions
  3. Ensure your Facebook app has Instagram Basic Display API enabled

### Error: "Instagram access token is required"

- **Solution**: Set a valid Instagram access token in your settings
- **How to get one**:
  1. Go to Facebook Developer Console
  2. Select your app
  3. Go to Tools > Graph API Explorer
  4. Generate an access token with `instagram_basic` and `instagram_content_publish` permissions

## Required Permissions

Your Instagram access token must have these permissions:

- `instagram_basic`
- `instagram_content_publish`
- `pages_show_list` (if using Facebook Page)
- `pages_read_engagement` (if using Facebook Page)

## API Version

The current implementation uses Facebook Graph API v23.0. Make sure your access token and app are configured for this version.
