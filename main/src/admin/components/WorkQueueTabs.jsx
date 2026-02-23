import { useState } from 'react';

const tabStyle = {
  background: 'white',
  borderRadius: 20,
  boxShadow: '0 2px 8px rgba(20,184,166,0.08)',
  padding: 24,
  marginBottom: 32
};

const WorkQueueTabs = ({ data }) => {
  const [tab, setTab] = useState('listings');
  return (
    <div style={tabStyle}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <button style={{ color: tab === 'listings' ? '#14b8a6' : '#0a1628', fontWeight: 700, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }} onClick={() => setTab('listings')}>Pending Listings</button>
        <button style={{ color: tab === 'offers' ? '#14b8a6' : '#0a1628', fontWeight: 700, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }} onClick={() => setTab('offers')}>Pending Offers</button>
        <button style={{ color: tab === 'docs' ? '#14b8a6' : '#0a1628', fontWeight: 700, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }} onClick={() => setTab('docs')}>Pending Docs</button>
      </div>
      {tab === 'listings' && <div>{/* Table of pending listings with Approve/Reject */}No pending listings.</div>}
      {tab === 'offers' && <div>{/* Table of pending offers with Review */}No pending offers.</div>}
      {tab === 'docs' && <div>{/* Table of pending docs with Verify */}No pending docs.</div>}
    </div>
  );
};

export default WorkQueueTabs;
