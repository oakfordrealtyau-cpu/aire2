export default async function handler(req, res) {
  // Allow requests from anywhere (for testing)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const AppSecret = "hg4IwDpf2tvbVdBGc6nwP5x2XGCIlNv8";
    const { client_id, request_id, time, version } = req.body;

    const message = `client_id=${client_id}&request_id=${request_id}&time=${time}&version=${version}`;
    const sign = require("crypto").createHmac("sha256", AppSecret).update(message).digest("hex");

    const payload = { client_id, request_id, time, version, sign };

    const r = await fetch("https://api.arpha-tech.com/api/v3/openapi/init", {
      method: "POST",
      headers: { "Content-Type": "application/json", "App-Name": "cldbus" },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
