// api/login-or-register.js
import fetch from "node-fetch";
import crypto from "crypto";

const AppSecret = "hg4IwDpf2tvbVdBGc6nwP5x2XGCIlNv8";
const BaseApiUrl = "https://api.arpha-tech.com";

function hmacSha256(message, secret) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { client_id, encryptedData, request_id, time } = req.body;
    if (!client_id || !encryptedData || !request_id || !time) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Build signature (HMAC-SHA256)
    const message = `client_id=${client_id}&post_data=${encryptedData}&request_id=${request_id}&time=${time}`;
    const sign = hmacSha256(message, AppSecret);

    const body = {
      client_id,
      post_data: encryptedData,
      request_id,
      time,
      sign,
    };

    // Call original login API
    const apiRes = await fetch(`${BaseApiUrl}/api/v3/openapi/auth/login-or-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en",
        "App-Name": "cldbus",
      },
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();

    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Login failed", details: err.message });
  }
}