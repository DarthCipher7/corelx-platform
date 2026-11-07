import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, _bot_hp } = body;

    // Honeypot spam protection
    if (_bot_hp) {
      // Silently accept bot submission without processing
      return NextResponse.json({ success: true, message: "Message dispatched." });
    }

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide your name." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const validSubjects = ["General", "Partnerships", "Press", "Support", "Careers"];
    if (!subject || !validSubjects.includes(subject)) {
      return NextResponse.json(
        { success: false, error: "Please select a valid subject category." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: "Message must contain at least 20 characters." },
        { status: 400 }
      );
    }

    // TODO: Wire to Zoho SMTP email relay or transactional service (e.g. Resend/Postmark)
    // Example:
    // await sendMail({
    //   from: 'contact-form@corelx.app',
    //   to: subject === 'Press' ? 'press@corelx.app' : subject === 'Partnerships' ? 'partners@corelx.app' : 'support@corelx.app',
    //   subject: `[CORELX Contact] ${subject} from ${name}`,
    //   text: `From: ${name} (${email})\nSubject: ${subject}\n\n${message}`
    // });

    return NextResponse.json({
      success: true,
      message: "Thanks! We will get back to you within 48 hours.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to transmit message. Please try again." },
      { status: 500 }
    );
  }
}
