// api/login.js
import crypto from "crypto";

const AppSecret = "hg4IwDpf2tvbVdBGc6nwP5x2XGCIlNv8";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { client_id, encryptedData, request_id, time } = req.body;

    if (!client_id || !encryptedData || !request_id || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate sign
    const message =
      `client_id=${client_id}` +
      `&post_data=${encryptedData}` +
      `&request_id=${request_id}` +
      `&time=${time}`;

    const sign = crypto
      .createHmac("sha256", AppSecret)
      .update(message)
      .digest("hex");

    const response = await fetch(
      "https://api.arpha-tech.com/api/v3/openapi/auth/login-or-register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "App-Name": "cldbus",
          "Accept-Language": "en"
        },
        body: JSON.stringify({
          client_id,
          post_data: encryptedData,
          request_id,
          time,
          sign
        })
      }
    );

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}