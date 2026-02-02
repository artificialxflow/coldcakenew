# راهنمای یکپارچه‌سازی Google Apps Script با Cold Cake

این راهنما نحوه دریافت Google Cloud Client ID/Secret و استفاده از آن در Google Apps Script را توضیح می‌دهد.

## مراحل دریافت Client ID و Secret

### 1. ایجاد یا انتخاب پروژه در Google Cloud Console

1. به [Google Cloud Console](https://console.cloud.google.com) بروید
2. یک پروژه جدید ایجاد کنید یا پروژه موجود را انتخاب کنید
3. نام پروژه را مشخص کنید (مثلاً "Cold Cake Integration")

### 2. فعال‌سازی APIs لازم

1. به بخش **APIs & Services** → **Library** بروید
2. APIs زیر را جستجو و فعال کنید:
   - **Google Drive API** (برای دسترسی به Drive)
   - **Google Sheets API** (برای دسترسی به Sheets)
   - **Google Apps Script API** (اختیاری - برای مدیریت اسکریپت‌ها)

### 3. پیکربندی OAuth Consent Screen

1. به بخش **APIs & Services** → **OAuth consent screen** بروید
2. User Type: **External** را انتخاب کنید (برای استفاده شخصی می‌توانید Internal را انتخاب کنید)
3. اطلاعات اپلیکیشن را وارد کنید:
   - **App name**: Cold Cake Integration
   - **User support email**: ایمیل شما
   - **Developer contact information**: ایمیل شما
4. Scopes را اضافه کنید:
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/spreadsheets`
5. **Test users** را اضافه کنید (ایمیل Google خود را)
6. روی **Save and Continue** کلیک کنید

### 4. ایجاد OAuth 2.0 Credentials

1. به بخش **APIs & Services** → **Credentials** بروید
2. روی **+ CREATE CREDENTIALS** کلیک کنید
3. **OAuth client ID** را انتخاب کنید
4. Application type: **Web application** را انتخاب کنید
5. Name: "Cold Cake Web Client" یا نام دلخواه
6. **Authorized redirect URIs** را خالی بگذارید (برای Google Apps Script نیاز نیست)
7. روی **CREATE** کلیک کنید
8. **Client ID** و **Client Secret** نمایش داده می‌شوند
9. **مهم**: Client Secret را کپی کنید (فقط یکبار نمایش داده می‌شود!)

### 5. ثبت در Cold Cake

1. وارد پنل مدیریت Cold Cake شوید
2. به بخش **تنظیمات** → **یکپارچه‌سازی‌ها** بروید
3. Client ID و Client Secret را در فیلدهای مربوطه وارد کنید
4. تنظیمات را ذخیره کنید

## استفاده در Google Apps Script

### مثال: اتصال به Cold Cake API

```javascript
// Configuration
const COLD_CAKE_API_URL = 'https://coldcake.ir/api';
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

// Function to get access token
function getAccessToken() {
  const service = getOAuthService();
  if (service.hasAccess()) {
    return service.getAccessToken();
  } else {
    const authorizationUrl = service.getAuthorizationUrl();
    Logger.log('Open this URL and re-run the script: %s', authorizationUrl);
    throw new Error('Authorization required. Please run authorize() first.');
  }
}

// OAuth Service Setup
function getOAuthService() {
  return OAuth2.createService('ColdCake')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setScope('https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets')
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties());
}

// Authorization callback
function authCallback(request) {
  const service = getOAuthService();
  const authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

// Authorize function (run this first)
function authorize() {
  getOAuthService().getAuthorizationUrl();
  getAccessToken();
}

// Example: Call Cold Cake API
function getCustomersFromColdCake() {
  const accessToken = getAccessToken();
  const response = UrlFetchApp.fetch(`${COLD_CAKE_API_URL}/customers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = JSON.parse(response.getContentText());
  Logger.log(data);
  return data;
}

// Example: Write to Google Sheets
function syncCustomersToSheet() {
  const customers = getCustomersFromColdCake();
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Clear existing data
  sheet.clear();
  
  // Headers
  sheet.getRange(1, 1, 1, 4).setValues([['ID', 'نام', 'نام خانوادگی', 'تلفن']]);
  
  // Data
  const rows = customers.map(c => [c.id, c.firstName, c.lastName, c.phone || '']);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }
}
```

### Trigger-based Automation

```javascript
// Run daily at 9 AM
function setupDailyTrigger() {
  ScriptApp.newTrigger('syncCustomersToSheet')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}
```

## نکات مهم

1. **Client Secret فقط یکبار نمایش داده می‌شود** - آن را در جای امن ذخیره کنید
2. برای محیط Production، باید OAuth consent screen را verify کنید
3. Scopes اضافه شده را در Google Cloud Console بررسی کنید
4. Test users باید قبل از استفاده تایید شوند

## لینک‌های مفید

- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Apps Script OAuth Guide](https://developers.google.com/apps-script/guides/oauth)
