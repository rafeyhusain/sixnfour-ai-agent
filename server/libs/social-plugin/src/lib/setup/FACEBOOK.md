# Facebook Setup Guide

## Facebook & Instagram Access Token

Follow these steps to get `Access Token`. Make sure you already have a `facebook` account/page and `instagram` account.

### Create App

- Go to [facebook apps](https://developers.facebook.com/apps/)
- Click [create app](https://developers.facebook.com/apps/creation/)
  - App details
    - Enter `App name` = `ai-marketing-agent` or better `your business name` e.g. `PizzaHut`
    - Click `Next`
  - Use cases
    - Select `Content management` in sidebar
    - Check `Manage everything on your Page`
    - Check `Manage messaging & content on Instagram`
    - Click `Next`
  - Business
    - Select `I don’t want to connect a business portfolio yet.`
    - Click `Next`
  - Requirements
    - Click `Next`
  - Overview
    - Click `Go to dashboard`

### Set Permissions

- In [Dashboard](https://developers.facebook.com/apps/your-app-id-here/dashboard) sidebar click [Use cases](https://developers.facebook.com/apps/your-app-id-here/use_cases)
  - Select `Manage everything on your Page`
    - Click `Add` for following to add required permission:
    - `business_management`
    - `pages_show_list`
    - `pages_manage_posts`
    - `public_profile`
    - `pages_read_engagement`
    - `pages_manage_metadata`

### Get Access Token

- Under `Tools` menu, select [Graph API Explorer](https://developers.facebook.com/tools/explorer)
  - On right sidebar select your `Meta App`
  - In `User or Page` dropdown select your page e.g. `PizzaHut` (Under `Page Access Token`)
  - If a page pops up `Select All` and hit `Continue` button
  - In `Permissions` dropdown select following permissions:
    - `business_management`
    - `pages_show_list`
    - `pages_manage_posts`
    - `public_profile`
    - `pages_read_engagement`
    - `pages_manage_metadata`
  - Click `Generate Access Token` button
  - Click `Copy Token` button

### Extend Expiry of Access Token

- Usually tokens are short lived with `1 hour` expiry. Follow steps below to extend expiry
  - To make expiry `3 months`:
    - Under `Tools` menu, select [Access token debugger](https://developers.facebook.com/tools/debug/accesstoken)
    - Paste the token in the textbox at the top and hit `Debug` button
    - Click `Extend` button at the bottom of the page
    - Copy `Access Token` appearing next to `Extend` button.
    - This token has `3 month` expiry

  - To make expiry `Never`:
    - Go to select [Graph API Explorer](https://developers.facebook.com/tools/explorer) once again
    - Paste `Access Token` in textbox above `Generate Access Token` button
    - Click `Generate Access Token` button
    - This token has `Never` expiry
- Save `Access Token` as it will be required later

### Get Page ID

- Go to your [facebook page](https://www.facebook.com/profile.php?id=your-page-id-here&sk=about_profile_transparency) to get `Page ID`
  - On your page, select `About` tab
  - Select `Page transparency` in sidebar
  - Copy `Page ID` e.g. `223949078473116`
- Save `Page ID` as it will be required later
