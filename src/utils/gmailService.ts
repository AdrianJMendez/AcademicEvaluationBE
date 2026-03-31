import nodemailer from 'nodemailer';
import { emailConfig } from '../config';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    attachments?: Array<{
        filename: string;
        content?: string | Buffer;
        path?: string;
        contentType?: string;
    }>;
}

interface TemplateData {
    [key: string]: string | number | boolean | Date | null | undefined;
}

class GmailEmailService {
    private static transporter: nodemailer.Transporter;
    private static isInitialized = false;
    private static lastSentTime = 0;
    private static readonly RATE_LIMIT_MS = 1000;

    private static defaultSender : string = "athlo.enterprise@gmail.com"

    private static initialize() {
        if (!this.isInitialized) {
            this.transporter = nodemailer.createTransport(emailConfig);
            
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('Error al conectar con Gmail:', error);
                } else {
                    console.log('Servicio de correo Gmail listo');
                    this.isInitialized = true;
                }
            });
        }
        return this.transporter;
    }


    private static async applyRateLimit() {
        const now = Date.now();
        const timeSinceLastSend = now - this.lastSentTime;
        
        if (timeSinceLastSend < this.RATE_LIMIT_MS) {
            const delay = this.RATE_LIMIT_MS - timeSinceLastSend;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        this.lastSentTime = Date.now();
    }

    private static formatValue(value: any): string {
        if (value === null || value === undefined) return '';
        if (value instanceof Date) return value.toLocaleString();
        if (typeof value === 'object') return JSON.stringify(value);
        
        // Escapar caracteres HTML
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    private static formatEmailHtml(htmlTemplate: string, values: TemplateData): string {
        let formattedHtml = htmlTemplate;
        
        for (const [key, value] of Object.entries(values)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            formattedHtml = formattedHtml.replace(regex, this.formatValue(value));
        }
        
        return formattedHtml;
    }

    static async sendEmail(recipient : string, subject: string, template : string,  content: TemplateData): Promise<any> {
        try {
            this.initialize();
            await this.applyRateLimit();
            const formattedHtml = this.formatEmailHtml(template, content);
            const formattedText = this.stripHtml(formattedHtml);

            const mailOptions: nodemailer.SendMailOptions = {
                from: this.defaultSender,
                to: recipient,
                subject: subject,
                text: formattedText,
                html: formattedHtml
            };

            const info = await this.transporter.sendMail(mailOptions);
                        
            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };
        } catch (error) {
            console.error('Error al enviar correo:', error);
            return {
                success: false,
                messageId: null,
                response: null
            }
        }
    }

    private static stripHtml(html: string): string {
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

}

export default GmailEmailService;