const cardStyle = {
  background: 'white',
  borderRadius: 20,
  boxShadow: '0 4px 16px rgba(20,184,166,0.08)',
  padding: 24,
  minWidth: 180,
  marginRight: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '2px solid #e0e0e0'
};

const KpiCards = ({ stats }) => (
  <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
    <div style={cardStyle}>
      <div style={{ color: '#14b8a6', fontWeight: 700, fontSize: 32 }}>{stats.pendingListings}</div>
      <div style={{ color: '#0a1628', fontWeight: 600 }}>Pending Listings</div>
    </div>
    <div style={cardStyle}>
      <div style={{ color: '#14b8a6', fontWeight: 700, fontSize: 32 }}>{stats.pendingOffers}</div>
      <div style={{ color: '#0a1628', fontWeight: 600 }}>Pending Offers</div>
    </div>
    <div style={cardStyle}>
      <div style={{ color: '#14b8a6', fontWeight: 700, fontSize: 32 }}>{stats.pendingDocs}</div>
      <div style={{ color: '#0a1628', fontWeight: 600 }}>Pending Docs</div>
    </div>
    <div style={cardStyle}>
      <div style={{ color: '#14b8a6', fontWeight: 700, fontSize: 32 }}>{stats.newUsersToday}</div>
      <div style={{ color: '#0a1628', fontWeight: 600 }}>New Users Today</div>
    </div>
  </div>
);

export default KpiCards;
