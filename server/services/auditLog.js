import db from '../config/db.js';

export default async function auditLog({ userId, action, oldValue, newValue, ip, userAgent }) {
  await db.query(
    'INSERT INTO audit_logs (user_id, action, old_value, new_value, ip, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [userId, action, JSON.stringify(oldValue), JSON.stringify(newValue), ip, userAgent]
  );
}
