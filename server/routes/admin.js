import express from 'express';
import { requirePermission } from '../middleware/auth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleMiddleware.js';
import { validateBody, validateQuery } from '../middleware/security.js';
import adminDashboardController from '../controllers/adminDashboardController.js';
import auditLog from '../services/auditLog.js';

const router = express.Router();

// Dashboard aggregation
router.get('/dashboard', requireAdmin, validateQuery('dashboard'), adminDashboardController.dashboard);

// Users
router.get('/users', requireAdmin, validateQuery('users'), adminDashboardController.listUsers);
router.post('/users', requireSuperAdmin, validateBody('createUser'), adminDashboardController.createUser);
router.patch('/users/:id', requireSuperAdmin, validateBody('updateUser'), adminDashboardController.updateUser);

// Listings
router.get('/listings', requireAdmin, validateQuery('listings'), adminDashboardController.listListings);
router.patch('/listings/:id/approve', requirePermission('LISTING_APPROVE'), adminDashboardController.approveListing);
router.patch('/listings/:id/reject', requirePermission('LISTING_REJECT'), adminDashboardController.rejectListing);

// Offers
router.get('/offers', requireAdmin, validateQuery('offers'), adminDashboardController.listOffers);
router.patch('/offers/:id/review', requirePermission('OFFER_REVIEW'), adminDashboardController.reviewOffer);

// Docs
router.get('/docs', requireAdmin, validateQuery('docs'), adminDashboardController.listDocs);
router.patch('/docs/:id/verify', requirePermission('DOC_VERIFY'), adminDashboardController.verifyDoc);

// Audit logs
router.get('/audit', requireSuperAdmin, validateQuery('audit'), adminDashboardController.listAuditLogs);

// Reports
router.get('/reports/export', requireAdmin, validateQuery('reportsExport'), adminDashboardController.exportReport);

export default router;
