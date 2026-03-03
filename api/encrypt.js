// api/encrypt.js
import forge from "node-forge";

export default async function handler(req, res) {
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

    // Convert PEM to forge public key
    const pub = forge.pki.publicKeyFromPem(publicKey);

    // Encrypt payload with RSA-OAEP
    const encrypted = pub.encrypt(JSON.stringify(payload), "RSA-OAEP");

    return res.status(200).json({ encrypted });
  } catch (err) {
    console.error("Encrypt function error:", err);
    return res.status(500).json({ error: "Encryption failed", details: err.message });
  }
}
