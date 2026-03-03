// api/encrypt.js
import forge from "node-forge";

  // Allow requests from anywhere (for testing)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { publicKey, payload } = req.body;

    if (!publicKey || !payload) {
      return res.status(400).json({ error: "Missing publicKey or payload" });
    }

    // Parse RSA public key
    const pub = forge.pki.publicKeyFromPem(publicKey);

    // Encrypt payload with RSA-OAEP
    const encrypted = pub.encrypt(JSON.stringify(payload), "RSA-OAEP");

    return res.status(200).json({ encrypted });
  } catch (err) {
    return res.status(500).json({ error: "Encryption failed", details: err.message });
  }
}

