// api/init.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const AppSecret = "hg4IwDpf2tvbVdBGc6nwP5x2XGCIlNv8";
    const { client_id, request_id, time, version } = req.body;

    if (!client_id || !request_id || !time || !version) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate sign
    const message = `client_id=${client_id}&request_id=${request_id}&time=${time}&version=${version}`;
    const sign = crypto.createHmac("sha256", AppSecret).update(message).digest("hex");

    // Build the payload for Arpha API
    const payload = {
      client_id,
      request_id,
      time,
      version,
      sign
    };

    // Call the real Arpha API
    const r = await fetch("https://api.arpha-tech.com/api/v3/openapi/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "App-Name": "cldbus"
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    // Return Arpha API response to the client
    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}