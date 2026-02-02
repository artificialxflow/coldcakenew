interface SendSmsParams {
  phone: string;
  message?: string;
  patternCode?: string;
  patternValues?: Record<string, string>;
}

interface TabanSmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

interface TabanApiResponse {
  data: {
    message_outbox_ids?: number[];
  } | null;
  meta: {
    status: boolean;
    message: string;
    message_code?: string;
    errors?: Record<string, string[]>;
  };
}

function formatRecipientToE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("98")) return `+${digits}`;
  if (digits.startsWith("09")) return `+98${digits.slice(1)}`;
  if (digits.startsWith("9") && digits.length === 10) return `+98${digits}`;
  if (phone.startsWith("+")) return phone;

  return `+98${digits}`;
}

function formatSenderToE164(sender: string): string {
  const digits = sender.replace(/\D/g, "");

  if (digits.startsWith("98")) return `+${digits}`;
  if (digits.startsWith("0")) return `+98${digits.slice(1)}`;
  if (sender.startsWith("+")) return sender;

  return `+98${digits}`;
}

async function sendSms(params: SendSmsParams): Promise<TabanSmsResponse> {
  const baseUrl = process.env.TABANSMS_BASE_URL;
  const apiKey = process.env.TABANSMS_API_KEY;
  const senderNumber = process.env.TABANSMS_SENDER_NUMBER;

  if (!baseUrl || !apiKey || !senderNumber) {
    return {
      success: false,
      error: "تنظیمات تابان اس‌ام‌اس کامل نیست.",
      errorCode: "CONFIG_ERROR",
    };
  }

  let body: Record<string, any>;

  if (params.patternCode && params.patternValues) {
    const recipient = formatRecipientToE164(params.phone);
    const from = formatSenderToE164(senderNumber);

    body = {
      sending_type: "pattern",
      from_number: from,
      code: params.patternCode,
      recipients: [recipient],
      params: params.patternValues,
    };
  } else if (params.message) {
    const recipient = params.phone;
    const from = senderNumber;

    body = {
      sending_type: "webservice",
      from_number: from,
      message: params.message,
      params: {
        recipients: [recipient],
      },
    };
  } else {
    return {
      success: false,
      error: "برای ارسال SMS باید message یا patternCode مشخص شود.",
      errorCode: "INVALID_PARAMS",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
    });

    const data: TabanApiResponse = await res.json();

    if (res.ok && data.meta.status && data.data?.message_outbox_ids?.length) {
      return {
        success: true,
        messageId: String(data.data.message_outbox_ids[0]),
      };
    }

    return {
      success: false,
      error: data.meta.message || "خطا در ارسال پیامک",
      errorCode: data.meta.message_code || String(res.status),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "خطای شبکه در ارسال پیامک",
      errorCode: "NETWORK_ERROR",
    };
  }
}

export async function sendOtpSms(phone: string, code: string): Promise<TabanSmsResponse> {
  const patternCode = process.env.TABANSMS_PATTERN_CODE;
  const patternVar = process.env.TABANSMS_PATTERN_VAR || "OTP";

  if (patternCode) {
    return sendSms({
      phone,
      patternCode,
      patternValues: { [patternVar]: code },
    });
  }

  const message = `کد ورود شما: ${code}\nاین کد تا 5 دقیقه معتبر است.`;

  return sendSms({
    phone,
    message,
  });
}


