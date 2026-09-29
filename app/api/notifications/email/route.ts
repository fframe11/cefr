import { NextRequest, NextResponse } from 'next/server';
import { sendFriendInviteEmail, sendAchievementEmail, sendEmail } from '@/lib/email/resend-client';
import { z } from 'zod';

const EmailRequestSchema = z.object({
  action: z.enum(['friend_invite', 'achievement', 'custom']),
  to: z.string().email(),
  inviterName: z.string().optional(),
  inviteCode: z.string().optional(),
  inviteUrl: z.string().url().optional(),
  username: z.string().optional(),
  achievementTitle: z.string().optional(),
  xpReward: z.number().optional(),
  subject: z.string().optional(),
  html: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = EmailRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email payload', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { action, to } = parsed.data;

    if (action === 'friend_invite') {
      const result = await sendFriendInviteEmail(
        to,
        parsed.data.inviterName || 'Your friend',
        parsed.data.inviteCode || 'GLOVA-2026',
        parsed.data.inviteUrl || 'https://glova.app'
      );
      return NextResponse.json(result);
    }

    if (action === 'achievement') {
      const result = await sendAchievementEmail(
        to,
        parsed.data.username || 'Student',
        parsed.data.achievementTitle || 'New Achievement',
        parsed.data.xpReward || 50
      );
      return NextResponse.json(result);
    }

    if (action === 'custom') {
      if (!parsed.data.subject || !parsed.data.html) {
        return NextResponse.json(
          { success: false, error: 'Subject and HTML required for custom email' },
          { status: 400 }
        );
      }
      const result = await sendEmail({
        to,
        subject: parsed.data.subject,
        html: parsed.data.html,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
