import { NextResponse } from "next/server";
import { handleError } from "@/lib/errorHandler";
import { welcomeTemplate } from "@/lib/emailTemplates";

const PROVIDER = process.env.EMAIL_PROVIDER || "sendgrid"; // 'ses' or 'sendgrid'

export async function POST(req: Request) {
  try {
    const { to, subject, message, template, templateVars } = await req.json();

    if (!to || !subject) return NextResponse.json({ success: false, message: "to and subject required" }, { status: 400 });

    const bodyHtml = template === "welcome" ? welcomeTemplate(templateVars?.name || "") : message;

    if (PROVIDER === "ses") {
      const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses");
      const ses = new SESClient({ region: process.env.AWS_REGION });
      const params = {
        Destination: { ToAddresses: [to] },
        Message: {
          Body: { Html: { Charset: "UTF-8", Data: bodyHtml } },
          Subject: { Charset: "UTF-8", Data: subject },
        },
        Source: process.env.SES_EMAIL_SENDER!,
      };

      const response = await ses.send(new SendEmailCommand(params));
      return NextResponse.json({ success: true, messageId: (response as any).MessageId }, { status: 200 });
    }

    // default: sendgrid
    const sendgrid = await import("@sendgrid/mail");
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
    const emailData = { to, from: process.env.SENDGRID_SENDER!, subject, html: bodyHtml };
    await sendgrid.send(emailData as any);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleError(error, "POST /api/email");
  }
}
