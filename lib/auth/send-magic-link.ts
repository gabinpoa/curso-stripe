import nodemailer from 'nodemailer';
import { createEncryptedSession } from './session';

export async function sendMagicLink(email: string, customerId: string, options: { courseName?: string, courseId?: string }) {
    // Create a transporter object
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) {
        throw new Error('SMTP configuration is missing in environment variables.');
    }
    if (!process.env.BASE_URL) {
        throw new Error('BASE_URL is not defined in environment variables.');
    }

    const { encryptedSession } = await createEncryptedSession(customerId);
    let magicLink = `${process.env.BASE_URL}/api/auth/link-magico?token=${encryptedSession}`;
    let subject = 'Acesse sua conta';
    let html = `<a href="${magicLink}">Clique aqui para acessar sua conta</a>`;

    if (options.courseName && options.courseId) {
        magicLink += `&courseId=${options.courseId}`;
        subject = 'Acesse sua compra: ' + options.courseName;
        html = `<a href="${magicLink}">${options.courseName}</a>`;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject,
        html
    };

    // Send the email using Promises
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}