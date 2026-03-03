// api/encrypt.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { publicKey, payload } = req.body;
    if (!publicKey || !payload) {
      return res.status(400).json({ error: "Missing publicKey or payload" });
    }

    // Call the external encryption API
    const apiRes = await fetch("http://54.90.205.243:5000/lndu-encrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey, payload })
    });

    const data = await apiRes.json();

    if (!data.encrypted) {
      return res.status(500).json({ error: "External encryption failed" });
    }

    return res.status(200).json({ encrypted: data.encrypted });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

