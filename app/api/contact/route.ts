import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  serviceType: z.enum(['mobile', 'web', 'saas', 'design', 'other']),
  budget: z.string().optional(),
  message: z.string().min(20).max(2000),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot check — bots fill this, humans don't
    if (typeof body['_honeypot'] === 'string' && body['_honeypot'].length > 0) {
      return NextResponse.json({ success: true });
    }

    const data = contactSchema.parse(body);

    if (!process.env.RESEND_API_KEY) {
      console.log('[contact] No RESEND_API_KEY — logging submission:', data.email);
      return NextResponse.json({ success: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Codezeen Contact <contact@codezeen.com>',
      to: 'hello@codezeen.com',
      replyTo: data.email,
      subject: `New enquiry: ${data.name} — ${data.serviceType}`,
      text: [
        `Name:    ${data.name}`,
        `Email:   ${data.email}`,
        `Service: ${data.serviceType}`,
        `Budget:  ${data.budget ?? 'Not specified'}`,
        '',
        'Message:',
        data.message,
      ].join('\n'),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: err.issues },
        { status: 400 },
      );
    }
    console.error('[contact] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
