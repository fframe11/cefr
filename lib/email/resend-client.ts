/**
 * GLOVA RESEND EMAIL CLIENT
 *
 * Server-side transactional email integration using Resend.
 * Strictly uses process.env.RESEND_API_KEY without exposing secrets to frontend.
 * Provides graceful sandbox/mock fallback when API key is unconfigured.
 */

export interface EmailSendParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  mock?: boolean;
  error?: string;
}

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'Glova English <notifications@glova.app>';

/**
 * Dispatches an email via Resend HTTP API.
 * Never runs on client side.
 */
export async function sendEmail(params: EmailSendParams): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 're_placeholder') {
    // Graceful developer / test mode fallback
    const mockId = `mock_resend_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      id: mockId,
      mock: true,
    };
  }

  try {
    const toAddresses = Array.isArray(params.to) ? params.to : [params.to];
    const payload = {
      from: params.from || DEFAULT_FROM,
      to: toAddresses,
      subject: params.subject,
      html: params.html,
      text: params.text,
    };

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Resend] API Error:', data);
      return {
        success: false,
        error: data.message || `Resend HTTP error ${response.status}`,
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (err: any) {
    console.error('[Resend] Network Exception:', err);
    return {
      success: false,
      error: err.message || 'Network exception calling Resend API',
    };
  }
}

/**
 * Send Friend Invitation Email
 */
export async function sendFriendInviteEmail(
  toEmail: string,
  inviterName: string,
  inviteCode: string,
  inviteUrl: string
): Promise<EmailSendResult> {
  return sendEmail({
    to: toEmail,
    subject: `${inviterName} invited you to study English on Glova!`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif, system-ui; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #FFFDF8; border-radius: 24px; border: 1px solid #EDE8DF; color: #24233A;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #5B5CE2; font-size: 28px; font-weight: 900; margin: 0;">GLOVA</h1>
          <p style="color: #77758A; font-size: 14px; margin-top: 4px;">University CEFR English Learning Platform</p>
        </div>
        <div style="background: #FFFFFF; border-radius: 20px; padding: 24px; border: 1px solid #E9E5FF; margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 800; margin-top: 0; color: #24233A;">
            👋 ${inviterName} ชวนคุณเข้าร่วมก๊วนเรียนภาษาอังกฤษ!
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #555368;">
            ร่วมฝึกฝนคำศัพท์ CEFR และท้าดวลประลองความเร็ว 4 วินาทีในโหมดแข่งขัน (Ranked Mode) เพื่อพัฒนาทักษะภาษาอังกฤษระดับมหาวิทยาลัยไปด้วยกัน
          </p>
          <div style="background: #F6F4FF; border-radius: 12px; padding: 12px 16px; margin: 20px 0; text-align: center;">
            <span style="font-size: 12px; color: #77758A; display: block; margin-bottom: 4px;">รหัสคำเชิญของคุณ:</span>
            <span style="font-size: 20px; font-weight: 800; color: #5B5CE2; letter-spacing: 2px;">${inviteCode}</span>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${inviteUrl}" style="display: inline-block; background: #5B5CE2; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 14px;">
              ตอบรับคำเชิญและเริ่มเรียนรู้
            </a>
          </div>
        </div>
        <p style="font-size: 11px; text-align: center; color: #9A97AA; margin: 0;">
          อีเมลนี้ถูกส่งอัตโนมัติจากระบบความปลอดภัย Glova English Platform เพื่อเชื่อมต่อการเรียนรู้ของนักศึกษา
        </p>
      </div>
    `,
    text: `${inviterName} invited you to study English on Glova! Join using code: ${inviteCode} at ${inviteUrl}`,
  });
}

/**
 * Send Achievement Unlock Notification
 */
export async function sendAchievementEmail(
  toEmail: string,
  username: string,
  achievementTitle: string,
  xpReward: number
): Promise<EmailSendResult> {
  return sendEmail({
    to: toEmail,
    subject: `🎉 Congratulations ${username}! You unlocked "${achievementTitle}" on Glova`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif, system-ui; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #FFFDF8; border-radius: 24px; border: 1px solid #EDE8DF; color: #24233A;">
        <h2 style="color: #F59E0B; margin-top: 0;">🏆 ปลดล็อกเหรียญเกียรติยศสำเร็จ!</h2>
        <p>ยินดีด้วยคุณ ${username}! คุณได้รับเหรียญ <strong>${achievementTitle}</strong> พร้อมรับโบนัส <strong>+${xpReward} XP</strong> เข้าสู่บัญชีผู้ใช้เรียบร้อยแล้ว</p>
      </div>
    `,
  });
}
