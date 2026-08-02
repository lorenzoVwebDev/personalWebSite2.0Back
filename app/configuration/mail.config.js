const {MailtrapClient } = require('mailtrap')
const {logEvents} = require("../middleware/logEvents")
require('dotenv').config()

const sendContactsMail = async (type, first_name, last_name, email) => {
    const client = new MailtrapClient({
    token: process.env.PW_MAILTRAP_API_TOKEN,
    });

    const sender = {
    email: "lorwebdev.notifications@lorenzo-viganego.com",
    name: "LorWebDev",
    };

    const recipients = [ 
        {
            name: first_name+' '+last_name,
            email: email
        }
    ];

    switch (type) {
        case ("mix"): {
            break;
        }
        case ("master"): {
            break;
        }
        default: {
            await client
            .send({
                from: sender,
                reply_to: { email: "notifications@lorenzo-viganego.com" },
                to: recipients,
                subject: "Contacts Notification",
                html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Contacts Notification</title>
                    </head>
                    <body style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:24px 0;">
                        <tr>
                        <td align="center">
                            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">

                            <!-- Header -->
                            <tr>
                                <td style="background-color:#2d3748; padding:24px 32px;">
                                <h1 style="margin:0; font-size:20px; color:#ffffff;">Lor Web Dev</h1>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:32px;">
                                <p style="margin:0 0 16px 0; font-size:15px; color:#2d3748; line-height:1.5;">
                                    Hello ${first_name+' '+last_name},
                                </p>
                                <p style="margin:0 0 16px 0; font-size:15px; color:#2d3748; line-height:1.5;">
                                    Thank you so much for contacting me! I'll be more than honoured to give
                                    you my competences. You can directly respond to that email and ask whatever you want to know
                                </p>

                                <p style="margin:16px 0 0 0; font-size:15px; color:#2d3748; line-height:1.5;">
                                    If you did not expect this notification, please contact our support team.
                                </p>
                                </td>
                            </tr>

                            <!-- CTA Button (optional) -->

                            <!-- Footer -->
                            <tr>
                                <td style="background-color:#f7fafc; padding:20px 32px; border-top:1px solid #e2e8f0;">
                                <p style="margin:0; font-size:12px; color:#a0aec0; line-height:1.5;">
                                    This is an automated message — <br>
                                    &copy; 2026 LorWebDev. All rights reserved.
                                </p>
                                </td>
                            </tr>

                            </table>
                        </td>
                        </tr>
                    </table>
                    </body>
                    </html>`,
                category: "Integration Test",
            })
            .then(res => logEvents("mail", "mail id"+" "+res.message_ids)).catch(res => console.log(res));
        }
    }
}

module.exports = {sendContactsMail}