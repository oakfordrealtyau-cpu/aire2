const ActivityFeed = ({ activities }) => (
  <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 2px 8px rgba(20,184,166,0.08)', padding: 24 }}>
    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: '#0a1628' }}>Activity Feed</div>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {activities.map((a, i) => (
        <li key={i} style={{ marginBottom: 12, color: '#0a1628' }}>
          <span style={{ color: '#14b8a6', fontWeight: 600 }}>{a.user}</span> {a.action} <span style={{ color: '#888', fontSize: 12 }}>{a.timestamp}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ActivityFeed;
