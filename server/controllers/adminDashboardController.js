import db from '../config/db.js';
import auditLog from '../services/auditLog.js';

// This controller returns safe mock data for the admin dashboard and simple
// responses for other admin endpoints so the frontend has data to display.
const adminDashboardController = {
  async dashboard(req, res) {
    try {
      // Return a full payload the frontend expects. Replace with real DB queries later.
      const data = {
        stats: {
          totalUsers: 6,
          newUsersToday: 1,
          pendingListings: 2,
          pendingOffers: 1,
          pendingDocs: 3,
          inspectionsToday: 2,
          completedPaymentsToday: 0,
          revenueToday: 0,
        },
        revenueData: [
          { date: new Date().toISOString().slice(0, 10), amount: 0 },
        ],
        systemData: {
          status: 'OK',
          activeSessions: 3,
          latestLogins: [],
        },
        activities: [
          {
            id: 1,
            action: 'Seeded sample activity',
            entity_type: 'system',
            entity_id: null,
            user_email: 'system@ai-re.local',
            created_at: new Date().toISOString(),
          },
        ],
        queues: {
          listings: [
            { id: 101, street_address: '46 Ellis Road', seller_name: 'Jane Seller' },
            { id: 102, street_address: '123 Main St', seller_name: 'John Agent' },
          ],
          offers: [
            { id: 201, property_id: 101, property_address: '46 Ellis Road', buyer_name: 'Alice Buyer', offer_amount: 800000 },
          ],
          documents: [
            { id: 301, property_id: 101, property_address: '46 Ellis Road', doc_type: 'Floor Plan', file_name: 'floorplan.pdf' },
            { id: 302, property_id: 102, property_address: '123 Main St', doc_type: 'Contract', file_name: 'contract.pdf' },
          ],
        },
      };

      return res.json({ data });
    } catch (err) {
      console.error('Admin dashboard error:', err);
      return res.status(500).json({ success: false, message: 'Failed to load dashboard' });
    }
  },

  async listUsers(req, res) {
    try {
      // Simple listing from `users` table (non-paginated, demo only)
      const [rows] = await db.execute('SELECT id, email, first_name, last_name, is_active FROM users LIMIT 200');
      res.json({ users: rows || [] });
    } catch (err) {
      console.error('listUsers error:', err);
      res.status(500).json({ users: [] });
    }
  },

  async createUser(req, res) {
    // Minimal placeholder: real implementation should validate and hash password
    res.json({ success: true, message: 'createUser endpoint placeholder' });
  },

  async updateUser(req, res) {
    res.json({ success: true, message: 'updateUser endpoint placeholder' });
  },

  async listListings(req, res) {
    try {
      // Return pending listings sample (real query should filter by status)
      const sample = [
        { id: 101, street_address: '46 Ellis Road', seller_name: 'Jane Seller', status: 'pending_approval' },
      ];
      res.json({ listings: sample });
    } catch (err) {
      console.error('listListings error:', err);
      res.status(500).json({ listings: [] });
    }
  },

  async approveListing(req, res) {
    try {
      const id = req.params.id;
      // Real implementation: update property status, audit log
      await auditLog({ userId: req.user?.id || null, action: `approve_listing:${id}`, oldValue: null, newValue: { status: 'active' }, ip: req.ip, userAgent: req.get('User-Agent') });
      res.json({ success: true });
    } catch (err) {
      console.error('approveListing error:', err);
      res.status(500).json({ success: false });
    }
  },

  async rejectListing(req, res) {
    try {
      const id = req.params.id;
      const reason = req.body?.reason || null;
      await auditLog({ userId: req.user?.id || null, action: `reject_listing:${id}`, oldValue: null, newValue: { status: 'rejected', reason }, ip: req.ip, userAgent: req.get('User-Agent') });
      res.json({ success: true });
    } catch (err) {
      console.error('rejectListing error:', err);
      res.status(500).json({ success: false });
    }
  },

  async listOffers(req, res) {
    try {
      const sample = [
        { id: 201, property_id: 101, buyer_name: 'Alice Buyer', offer_amount: 800000, status: 'pending' },
      ];
      res.json({ offers: sample });
    } catch (err) {
      console.error('listOffers error:', err);
      res.status(500).json({ offers: [] });
    }
  },

  async reviewOffer(req, res) {
    try {
      const id = req.params.id;
      await auditLog({ userId: req.user?.id || null, action: `review_offer:${id}`, oldValue: null, newValue: { reviewed: true }, ip: req.ip, userAgent: req.get('User-Agent') });
      res.json({ success: true });
    } catch (err) {
      console.error('reviewOffer error:', err);
      res.status(500).json({ success: false });
    }
  },

  async listDocs(req, res) {
    try {
      const sample = [
        { id: 301, property_id: 101, doc_type: 'Floor Plan', file_name: 'floorplan.pdf', status: 'pending' },
      ];
      res.json({ docs: sample });
    } catch (err) {
      console.error('listDocs error:', err);
      res.status(500).json({ docs: [] });
    }
  },

  async verifyDoc(req, res) {
    try {
      const id = req.params.id;
      await auditLog({ userId: req.user?.id || null, action: `verify_doc:${id}`, oldValue: null, newValue: { verified: true }, ip: req.ip, userAgent: req.get('User-Agent') });
      res.json({ success: true });
    } catch (err) {
      console.error('verifyDoc error:', err);
      res.status(500).json({ success: false });
    }
  },

  async listAuditLogs(req, res) {
    try {
      const [rows] = await db.execute('SELECT id, user_id, action, old_value, new_value, ip, user_agent, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 50');
      res.json({ logs: rows || [] });
    } catch (err) {
      console.error('listAuditLogs error:', err);
      res.status(500).json({ logs: [] });
    }
  },

  async exportReport(req, res) {
    try {
      // For now return a dummy URL. Real export should stream CSV.
      res.json({ url: '/download/report.csv' });
    } catch (err) {
      console.error('exportReport error:', err);
      res.status(500).json({ message: 'Failed to export' });
    }
  },
};

export default adminDashboardController;
