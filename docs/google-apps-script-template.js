/**
 * Google Apps Script Template برای یکپارچه‌سازی با Cold Cake
 * 
 * دستورالعمل:
 * 1. این کد را در Google Apps Script Editor کپی کنید
 * 2. CLIENT_ID و CLIENT_SECRET را از پنل تنظیمات Cold Cake دریافت کنید
 * 3. تابع authorize() را یکبار اجرا کنید تا دسترسی را تایید کنید
 * 4. از توابع دیگر استفاده کنید
 */

// ==================== Configuration ====================
const COLD_CAKE_API_URL = 'https://coldcake.ir/api';
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';

// ==================== OAuth Setup ====================

/**
 * ایجاد OAuth Service
 */
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

/**
 * دریافت Access Token
 */
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

/**
 * Authorization Callback
 */
function authCallback(request) {
  const service = getOAuthService();
  const authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

/**
 * Authorize function - این را یکبار اجرا کنید
 */
function authorize() {
  const service = getOAuthService();
  const authorizationUrl = service.getAuthorizationUrl();
  Logger.log('Open the following URL and re-run the script: %s', authorizationUrl);
  getAccessToken();
}

// ==================== Cold Cake API Functions ====================

/**
 * دریافت لیست مشتریان از Cold Cake
 */
function getCustomersFromColdCake() {
  try {
    const accessToken = getAccessToken();
    const response = UrlFetchApp.fetch(`${COLD_CAKE_API_URL}/customers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      Logger.log('Customers retrieved:', data);
      return data;
    } else {
      Logger.log('Error:', response.getContentText());
      throw new Error('Failed to fetch customers');
    }
  } catch (error) {
    Logger.log('Error in getCustomersFromColdCake:', error);
    throw error;
  }
}

/**
 * دریافت لیست محصولات از Cold Cake
 */
function getProductsFromColdCake() {
  try {
    const accessToken = getAccessToken();
    const response = UrlFetchApp.fetch(`${COLD_CAKE_API_URL}/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      Logger.log('Products retrieved:', data);
      return data;
    } else {
      Logger.log('Error:', response.getContentText());
      throw new Error('Failed to fetch products');
    }
  } catch (error) {
    Logger.log('Error in getProductsFromColdCake:', error);
    throw error;
  }
}

/**
 * دریافت گزارش‌ها از Cold Cake
 */
function getReportsFromColdCake() {
  try {
    const accessToken = getAccessToken();
    const response = UrlFetchApp.fetch(`${COLD_CAKE_API_URL}/reports/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      Logger.log('Reports retrieved:', data);
      return data;
    } else {
      Logger.log('Error:', response.getContentText());
      throw new Error('Failed to fetch reports');
    }
  } catch (error) {
    Logger.log('Error in getReportsFromColdCake:', error);
    throw error;
  }
}

// ==================== Google Sheets Integration ====================

/**
 * همگام‌سازی مشتریان با Google Sheets
 */
function syncCustomersToSheet() {
  try {
    const customers = getCustomersFromColdCake();
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Clear existing data
    sheet.clear();
    
    // Headers
    const headers = [['ID', 'نام', 'نام خانوادگی', 'تلفن', 'ایمیل', 'تعداد خرید']];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
    sheet.getRange(1, 1, 1, headers[0].length).setFontWeight('bold');
    
    // Data
    if (customers && customers.length > 0) {
      const rows = customers.map(c => [
        c.id,
        c.firstName || '',
        c.lastName || '',
        c.phone || '',
        c.email || '',
        c.totalPurchases || 0
      ]);
      sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);
      Logger.log(`Synced ${rows.length} customers to sheet`);
    }
  } catch (error) {
    Logger.log('Error in syncCustomersToSheet:', error);
    throw error;
  }
}

/**
 * همگام‌سازی محصولات با Google Sheets
 */
function syncProductsToSheet() {
  try {
    const products = getProductsFromColdCake();
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Clear existing data
    sheet.clear();
    
    // Headers
    const headers = [['ID', 'نام', 'قیمت', 'موجودی', 'دسته‌بندی']];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
    sheet.getRange(1, 1, 1, headers[0].length).setFontWeight('bold');
    
    // Data
    if (products && products.length > 0) {
      const rows = products.map(p => [
        p.id,
        p.name || '',
        p.finalPrice || 0,
        p.stock || 0,
        p.category || ''
      ]);
      sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);
      Logger.log(`Synced ${rows.length} products to sheet`);
    }
  } catch (error) {
    Logger.log('Error in syncProductsToSheet:', error);
    throw error;
  }
}

// ==================== Google Drive Integration ====================

/**
 * ایجاد فایل Excel از گزارش‌ها
 */
function exportReportsToDrive() {
  try {
    const reports = getReportsFromColdCake();
    
    // Create spreadsheet
    const spreadsheet = SpreadsheetApp.create('Cold Cake Reports - ' + new Date().toLocaleDateString('fa-IR'));
    const sheet = spreadsheet.getActiveSheet();
    
    // Add report data
    sheet.getRange(1, 1).setValue('گزارش مالی');
    sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
    
    sheet.getRange(3, 1, 1, 2).setValues([['عنوان', 'مقدار']]);
    sheet.getRange(3, 1, 1, 2).setFontWeight('bold');
    
    const data = [
      ['فروش ماه جاری', reports.monthlySales || 0],
      ['سرمایه در گردش', reports.workingCapital || 0],
      ['موجودی کل', reports.totalInventory || 0],
      ['مجموع طلب‌ها', reports.totalDebts || 0]
    ];
    
    sheet.getRange(4, 1, data.length, 2).setValues(data);
    
    Logger.log('Report exported to Drive:', spreadsheet.getUrl());
    return spreadsheet.getUrl();
  } catch (error) {
    Logger.log('Error in exportReportsToDrive:', error);
    throw error;
  }
}

// ==================== Triggers ====================

/**
 * Setup daily trigger (runs at 9 AM)
 */
function setupDailyTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncCustomersToSheet') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger
  ScriptApp.newTrigger('syncCustomersToSheet')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  
  Logger.log('Daily trigger setup complete');
}

/**
 * Setup hourly trigger
 */
function setupHourlyTrigger() {
  ScriptApp.newTrigger('syncCustomersToSheet')
    .timeBased()
    .everyHours(1)
    .create();
  
  Logger.log('Hourly trigger setup complete');
}
