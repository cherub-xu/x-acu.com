export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test endpoint
    if (url.pathname === "/api/test") {
      return Response.json({
        success: true,
        message: "X-ACU booking system is working"
      });
    }

    // Booking endpoint
    if (url.pathname === "/api/book" && request.method === "POST") {
      try {
        const data = await request.json();

        if (!data.name || !data.email || !data.phone) {
          return Response.json(
            {
              success: false,
              error: "Missing customer information"
            },
            { status: 400 }
          );
        }

        const name = data.name;
        const email = data.email;
        const phone = data.phone;
        const service = data.service || "Not specified";
        const date = data.date || "Not specified";
        const time = data.time || "Not specified";
        const notes = data.notes || "None";

        const emailText = `
New X-ACU Booking Request

Name: ${name}
Email: ${email}
Phone: ${phone}

Service: ${service}
Preferred Date: ${date}
Preferred Time: ${time}

Additional Information:
${notes}
`;

        const resendResponse = await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "X-ACU Booking <booking@x-acu.com>",
              to: ["X-ACU@Hotmail.com"],
              subject: `New X-ACU Booking Request - ${name}`,
              text: emailText
            })
          }
        );

        const resendText = await resendResponse.text();

        console.log("RESEND STATUS:", resendResponse.status);
        console.log("RESEND RESPONSE:", resendText);

        if (!resendResponse.ok) {
          return Response.json(
            {
              success: false,
              error: "Email could not be sent",
              details: resendText
            },
            { status: 500 }
          );
        }

        return Response.json({
          success: true,
          message: "Booking request received and email sent",
          resend: resendText
        });

      } catch (error) {
        console.error("BOOKING ERROR:", error);

        return Response.json(
          {
            success: false,
            error: "Booking system error",
            details: String(error)
          },
          { status: 500 }
        );
      }
    }

    const page = await fetch(
      "https://raw.githubusercontent.com/cherub-xu/x-acu.com/main/booking.html"
    );

    return new Response(page.body, {
      headers: {
        "content-type": "text/html; charset=UTF-8"
      }
    });
  }
};
