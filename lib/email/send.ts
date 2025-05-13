export async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) {
        throw new Error('SMTP configuration is missing in environment variables.');
    }

    const smtpPort = parseInt(process.env.SMTP_PORT, 10);
    const smtpTransportOptions = {
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    };

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject,
        html
    };

    try {
        const response = await fetch('https://smtp-api-layer.vercel.app/api/smtp-send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                smtpTransportOptions,
                mailOptions,
            })
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
