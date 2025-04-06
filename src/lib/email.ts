import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Vérifier la connexion au démarrage
transporter.verify(function(error, success) {
  if (error) {
    console.log('Erreur de configuration SMTP:', error);
  } else {
    console.log('Serveur SMTP prêt à envoyer des emails');
  }
});

export async function sendVerificationEmail(email: string, token: string) {
  // S'assurer que l'URL de base est définie
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Bingoo',
      address: process.env.SMTP_FROM || 'nobeco@reussirafrique.com'
    },
    to: email,
    subject: 'Vérification de votre compte Bingoo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e11d48;">Bienvenue sur Bingoo !</h1>
        <p>Merci de vous être inscrit. Pour commencer à jouer, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Vérifier mon compte
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #666; font-size: 14px;">Ce lien expirera dans 24 heures.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}
