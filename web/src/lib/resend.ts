import { Resend } from 'resend';

// Initialiser Resend
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY non configurée - emails désactivés');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Adresse d'envoi (configurer un domaine vérifié sur Resend)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mon Rempart <noreply@monrempart.fr>';

// Template HTML pour email backup échoué
function getBackupFailedTemplate(params: {
    hostname: string;
    errorMessage: string;
    timestamp: string;
    dashboardUrl: string;
}): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerte Sauvegarde</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td>
                <!-- Header -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px 16px 0 0; padding: 30px;">
                    <tr>
                        <td align="center">
                            <div style="width: 60px; height: 60px; background-color: rgba(239, 68, 68, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                <span style="font-size: 28px;">⚠️</span>
                            </div>
                            <h1 style="color: #ef4444; font-size: 24px; margin: 0 0 8px 0;">Sauvegarde Échouée</h1>
                            <p style="color: #94a3b8; margin: 0; font-size: 14px;">Action requise</p>
                        </td>
                    </tr>
                </table>

                <!-- Content -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1e293b; padding: 30px;">
                    <tr>
                        <td>
                            <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                Une sauvegarde a échoué sur l'un de vos agents. Voici les détails :
                            </p>

                            <!-- Details Box -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                <tr>
                                    <td>
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="padding-bottom: 12px;">
                                                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Agent</span><br>
                                                    <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${params.hostname}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 12px;">
                                                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Date</span><br>
                                                    <span style="color: #ffffff; font-size: 16px;">${params.timestamp}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Erreur</span><br>
                                                    <span style="color: #ef4444; font-size: 14px; font-family: monospace;">${params.errorMessage}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="${params.dashboardUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                                            Voir dans le Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 0 0 16px 16px; padding: 24px;">
                    <tr>
                        <td align="center">
                            <p style="color: #64748b; font-size: 12px; margin: 0;">
                                🛡️ Mon Rempart - Sauvegarde souveraine pour les collectivités
                            </p>
                            <p style="color: #475569; font-size: 11px; margin: 8px 0 0 0;">
                                Vous recevez cet email car vous êtes inscrit sur Mon Rempart.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

// Types
interface BackupFailedEmailParams {
    to: string;
    hostname: string;
    errorMessage: string;
    agentId: string;
}

/**
 * Envoie un email d'alerte pour backup échoué
 */
export async function sendBackupFailedEmail(params: BackupFailedEmailParams): Promise<boolean> {
    if (!resend) {
        console.log('📧 Email désactivé (RESEND_API_KEY manquante)');
        return false;
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://monrempart.fr'}/dashboard/agent/${params.agentId}`;
    const timestamp = new Date().toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'short',
    });

    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: params.to,
            subject: `⚠️ Sauvegarde échouée - ${params.hostname}`,
            html: getBackupFailedTemplate({
                hostname: params.hostname,
                errorMessage: params.errorMessage || 'Erreur inconnue',
                timestamp,
                dashboardUrl,
            }),
        });

        if (error) {
            console.error('Erreur envoi email Resend:', error);
            return false;
        }

        console.log(`📧 Email alerte envoyé à ${params.to} pour agent "${params.hostname}"`);
        return true;

    } catch (error) {
        console.error('Erreur Resend:', error);
        return false;
    }
}

/**
 * Envoie un email de restauration terminée
 */
export async function sendRestoreCompletedEmail(params: {
    to: string;
    hostname: string;
    snapshotId: string;
    targetPath: string;
    success: boolean;
}): Promise<boolean> {
    if (!resend) {
        return false;
    }

    const subject = params.success
        ? `✅ Restauration terminée - ${params.hostname}`
        : `❌ Restauration échouée - ${params.hostname}`;

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: params.to,
            subject,
            html: `
                <h2>${params.success ? '✅ Restauration réussie' : '❌ Restauration échouée'}</h2>
                <p><strong>Agent :</strong> ${params.hostname}</p>
                <p><strong>Snapshot :</strong> ${params.snapshotId}</p>
                <p><strong>Destination :</strong> ${params.targetPath}</p>
            `,
        });

        return true;
    } catch {
        return false;
    }
}
