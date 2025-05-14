export async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.SMTP_FROM) {
        throw new Error('SMTP_FROM is missing in environment variables.');
    }
    if (!process.env.SMTP_API_URL) {
        throw new Error('SMTP_API_URL is missing in environment variables.');
    }
    if (!process.env.SMTP_AUTH_TOKEN) {
        throw new Error('SMTP_AUTH_TOKEN is missing in environment variables.');
    }

    const apiUrl = process.env.SMTP_API_URL + "/v1/messages";
    const authToken = process.env.SMTP_AUTH_TOKEN;

    const emailPayload = {
        subject,
        body: html,
        to,
        from: process.env.SMTP_FROM,
        headers: {
            "Content-Type": "text/plain; charset=us-ascii",
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify(emailPayload)
        });

        if (!response.ok || response.status !== 200) {
            throw new Error(`Failed to send email: ${response.statusText}`);
        }

        console.log('Email sent:', await response.json());
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
