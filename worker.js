export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/test") {
      return Response.json({
        success: true,
        message: "X-ACU booking system is working"
      });
    }

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

        const emailText = `
New X-ACU Booking Request

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

Service: ${data.service || "Not specified"}
Preferred Date: ${data.date || "Not specified"}
Preferred Time: ${data.time || "Not specified"}

Additional Information:
${data.notes || "None"}
`;

        const response = await fetch(
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
              subject: `New X-ACU Booking Request - ${data.name}`,
              text: emailText
            })
          }
        );

        const result = await response.text();

        console.log("RESEND STATUS:", response.status);
        console.log("RESEND RESPONSE:", result);

        if (!response.ok) {
          return Response.json(
            {
              success: false,
              error: "Resend rejected the email",
              details: result
            },
            { status: 500 }
          );
        }

        return Response.json({
          success: true,
          message: "Booking request received and email sent"
        });

      } catch (error) {
        console.error("BOOKING ERROR:", String(error));

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
