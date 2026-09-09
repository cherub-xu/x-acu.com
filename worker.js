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

    // Booking endpoint - temporary test
    if (url.pathname === "/api/book" && request.method === "POST") {
      try {
        const data = await request.json();

        if (!data.name || !data.email || !data.phone) {
          return Response.json(
            { success: false, error: "Missing customer information" },
            { status: 400 }
          );
        }

        return Response.json({
          success: true,
          message: "Booking information received",
          booking: data
        });
      } catch (error) {
        return Response.json(
          { success: false, error: "Invalid request" },
          { status: 400 }
        );
      }
    }

    return new Response("X-ACU Worker is running", {
      headers: {
        "content-type": "text/plain"
      }
    });
  }
};
// Trigger Cloudflare redeploy
