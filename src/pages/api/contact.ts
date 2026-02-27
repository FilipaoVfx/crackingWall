import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { name, email, subject, message } = data;

        // Validation
        if (!name || !email || !message) {
            return new Response(
                JSON.stringify({ message: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const RECIPIENT_EMAIL = import.meta.env.CONTACT_RECIPIENT_EMAIL || '';
        const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

        console.log('--- NEW CONTACT FORM SUBMISSION ---');
        console.log('To:', RECIPIENT_EMAIL);
        console.log('From Name:', name);
        console.log('From Email:', email);
        console.log('Subject:', subject || 'No Subject');
        console.log('-----------------------------------');

        // Send via Resend API
        if (RESEND_API_KEY) {
            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'CrackingWall <onboarding@resend.dev>',
                    to: [RECIPIENT_EMAIL],
                    reply_to: email,
                    subject: subject || `Contact from ${name}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px;">
                            <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                                New Contact Form Message
                            </h2>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p><strong>Message:</strong></p>
                            <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 4px;">${message}</p>
                        </div>
                    `,
                }),
            });

            if (!resendResponse.ok) {
                const errorBody = await resendResponse.json().catch(() => ({ message: 'Unknown Resend error' }));
                console.error('Resend API Error:', resendResponse.status, errorBody);
                return new Response(
                    JSON.stringify({
                        message: `Email service error: ${errorBody?.message || 'Failed to send email. Check your Resend API key.'}`,
                    }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
            }

            console.log('Email sent successfully via Resend!');
        } else {
            console.warn('RESEND_API_KEY not configured. Email logged to console only.');
        }

        return new Response(
            JSON.stringify({ message: 'Message sent successfully!' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Contact form error:', error);
        return new Response(
            JSON.stringify({ message: 'Internal server error. Please try again later.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
