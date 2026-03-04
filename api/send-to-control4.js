export default async function handler(req, res) {
  // ==============================
  // CORS HEADERS
  // ==============================
  res.setHeader("Access-Control-Allow-Origin", "*"); // Change to your domain in production
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || !message.Token || !message.ClientID) {
      return res.status(400).json({
        error: "Invalid payload. Token and ClientID required."
      });
    }

    console.log("[Proxy] Forwarding token to Control4 Node server...");

    const forwardResponse = await fetch(
      "http://54.90.205.243:3000/send-to-control4",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": "en",
          "App-Name": message.AppId || "cldbus"
        },
        body: JSON.stringify({ message })
      }
    );

    const responseText = await forwardResponse.text();

    if (!forwardResponse.ok) {
      console.error("[Proxy] Downstream error:", responseText);

      return res.status(forwardResponse.status).json({
        error: "Control4 server error",
        details: responseText
      });
    }

    console.log("[Proxy] SUCCESS: Token delivered");

    return res.status(200).json({
      success: true,
      message: "Token forwarded successfully"
    });

  } catch (error) {
    console.error("[Proxy] Internal error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
}