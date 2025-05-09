import { siteName } from '@/lib/utils';
import { sendEmail } from './send';

interface Course {
    name: string;
    id: string;
}

export async function sendRefundEmail(email: string, refundedCourses: Course[]) {
    const subject = `[${siteName}] Reembolso realizado com sucesso`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #FF5733;">Reembolso realizado</h1>
            <p>Olá,</p>
            <p>Informamos que o reembolso dos seguintes cursos foi realizado com sucesso:</p>
            <ul>
                ${refundedCourses.map(course => `<li>${course.name}</li>`).join('')}
            </ul>
            <p>Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.</p>
            <p>Atenciosamente,<br>Equipe ${siteName}</p>
        </div>
    `;

    await sendEmail(email, subject, html);
}