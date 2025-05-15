import { createEncryptedSession } from './session';
import { sendEmail } from '../email/send';
import { siteName } from '../utils'; // Import the dynamic site name

interface Course {
    name: string;
    id: string;
}

export async function sendMagicLink(
    email: string,
    customerId: string,
    options: { courses?: Course[]; encryptedSession?: string } = {}
) {
    if (!process.env.BASE_URL) {
        throw new Error('BASE_URL is not defined in environment variables.');
    }

    // Use the provided encryptedSession or create a new one
    const encryptedSession =
        options.encryptedSession || (await createEncryptedSession(customerId)).encryptedSession;

    const magicLinkBase = `${process.env.BASE_URL}/api/auth/link-magico?token=${encryptedSession}`;
    let subject = `[${siteName}] Acesse sua conta`;
    let html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #4CAF50;">Bem-vindo(a) à ${siteName}!</h1>
            <p>Olá,</p>
            <p>Você solicitou acesso à sua conta. Clique no botão abaixo para acessar:</p>
            <a target="_blank" href="${magicLinkBase}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Acessar Conta</a>
            <p>Se você não solicitou este acesso, ignore este e-mail.</p>
            <p>Atenciosamente,<br>Equipe ${siteName}</p>
        </div>
    `;

    // If courses are provided, include them in the email
    if (options.courses && options.courses.length > 0) {
        const courseLinks = options.courses.map(
            (course) => `<li><a href="${magicLinkBase}&courseId=${course.id}" style="color: #4CAF50; text-decoration: none;">${course.name}</a></li>`
        ).join('');

        subject = `[${siteName}] Bem-vindo(a) à nossa plataforma!`;
        html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h1 style="color: #4CAF50;">Bem-vindo(a) à ${siteName}!</h1>
                <p>Olá,</p>
                <p>Estamos felizes em tê-lo(a) conosco. Aqui estão os cursos que você adquiriu:</p>
                <ul>
                    ${courseLinks}
                </ul>
                <p>Clique nos links acima para acessar seus cursos.</p>
                <p>Se você não solicitou este acesso, ignore este e-mail.</p>
                <p>Atenciosamente,<br>Equipe ${siteName}</p>
            </div>
        `;
    }

    await sendEmail(email, subject, html);
}