-- =============================================
-- AI-RE DATABASE SCHEMA (4NF)
-- Fourth Normal Form Normalized Database
-- MySQL/MariaDB Compatible
-- =============================================

-- Drop existing tables if they exist (in reverse order of dependencies)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS message_attachments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS document_shares;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS document_types;
DROP TABLE IF EXISTS inspection_attendees;
DROP TABLE IF EXISTS inspections;
DROP TABLE IF EXISTS offer_conditions;
DROP TABLE IF EXISTS offers;
DROP TABLE IF EXISTS offer_statuses;
DROP TABLE IF EXISTS saved_properties;
DROP TABLE IF EXISTS property_features;
DROP TABLE IF EXISTS features;
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS property_types;
DROP TABLE IF EXISTS property_statuses;
DROP TABLE IF EXISTS suburbs;
DROP TABLE IF EXISTS states;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS billing_transactions;
DROP TABLE IF EXISTS billing_plans;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- REFERENCE TABLES (Lookup Tables)
-- =============================================

-- Roles Table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES
('buyer', 'Property buyer/searcher'),
('seller', 'Property seller/owner'),
('admin', 'System administrator'),
('agent', 'AI-RE support agent');

-- States Table (Australian States)
CREATE TABLE states (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO states (code, name) VALUES
('NSW', 'New South Wales'),
('VIC', 'Victoria'),
('QLD', 'Queensland'),
('WA', 'Western Australia'),
('SA', 'South Australia'),
('TAS', 'Tasmania'),
('ACT', 'Australian Capital Territory'),
('NT', 'Northern Territory');

-- Suburbs Table
CREATE TABLE suburbs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    postcode VARCHAR(4) NOT NULL,
    state_id INT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id),
    UNIQUE KEY unique_suburb (name, postcode, state_id)
);

-- Property Types Table
CREATE TABLE property_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO property_types (name, description) VALUES
('House', 'Standalone residential house'),
('Apartment', 'Unit in an apartment complex'),
('Townhouse', 'Multi-level attached housing'),
('Villa', 'Single-level attached housing'),
('Land', 'Vacant land'),
('Rural', 'Rural/farming property'),
('Commercial', 'Commercial property');

-- Property Statuses Table
CREATE TABLE property_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    display_color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO property_statuses (name, description, display_color) VALUES
('draft', 'Property listing in draft mode', '#6b7280'),
('pending_approval', 'Awaiting admin approval', '#f59e0b'),
('live', 'Active listing visible to buyers', '#10b981'),
('under_offer', 'Offer accepted, pending settlement', '#3b82f6'),
('sold', 'Property has been sold', '#14b8a6'),
('withdrawn', 'Listing withdrawn by seller', '#ef4444'),
('expired', 'Listing has expired', '#9ca3af');

-- Features Table
CREATE TABLE features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO features (name, category, icon) VALUES
('Air Conditioning', 'Climate', 'ac_unit'),
('Heating', 'Climate', 'heat'),
('Swimming Pool', 'Outdoor', 'pool'),
('Garden', 'Outdoor', 'yard'),
('Garage', 'Parking', 'garage'),
('Carport', 'Parking', 'car'),
('Balcony', 'Outdoor', 'balcony'),
('Deck', 'Outdoor', 'deck'),
('Dishwasher', 'Kitchen', 'dishwasher'),
('Built-in Wardrobes', 'Interior', 'wardrobe'),
('Floorboards', 'Interior', 'floor'),
('Alarm System', 'Security', 'security'),
('Intercom', 'Security', 'intercom'),
('Solar Panels', 'Energy', 'solar'),
('Study', 'Interior', 'study'),
('Ensuite', 'Bathroom', 'bathroom'),
('Walk-in Robe', 'Interior', 'wardrobe'),
('Fireplace', 'Climate', 'fireplace'),
('Outdoor Entertaining', 'Outdoor', 'outdoor'),
('Water Tank', 'Sustainability', 'water'),
('Shed', 'Outdoor', 'shed'),
('Tennis Court', 'Recreation', 'tennis'),
('Gym', 'Recreation', 'gym'),
('Spa', 'Recreation', 'spa'),
('City Views', 'Views', 'view'),
('Water Views', 'Views', 'water_view'),
('Renovated', 'Condition', 'renovated');

-- Offer Statuses Table
CREATE TABLE offer_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO offer_statuses (name, description) VALUES
('pending', 'Offer submitted, awaiting response'),
('viewed', 'Offer has been viewed by seller'),
('countered', 'Counter offer made'),
('accepted', 'Offer accepted'),
('rejected', 'Offer rejected'),
('withdrawn', 'Offer withdrawn by buyer'),
('expired', 'Offer expired');

-- Document Types Table
CREATE TABLE document_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    required_for_listing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO document_types (name, description, required_for_listing) VALUES
('Contract of Sale', 'Legal contract document', TRUE),
('Title', 'Property title certificate', TRUE),
('Floor Plan', 'Property floor plan', FALSE),
('Building Report', 'Building inspection report', FALSE),
('Pest Report', 'Pest inspection report', FALSE),
('Strata Report', 'Strata inspection report (for units)', FALSE),
('ID Document', 'Seller identification', TRUE),
('Brochure', 'Marketing brochure', FALSE),
('Photos', 'Property photos', TRUE),
('Energy Rating', 'Energy efficiency certificate', FALSE);

-- Billing Plans Table
CREATE TABLE billing_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_type ENUM('flat_fee', 'commission', 'subscription') NOT NULL,
    commission_rate DECIMAL(5, 2),
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO billing_plans (name, description, price, billing_type, commission_rate) VALUES
('Basic', 'Flat fee listing with essential features', 499.00, 'flat_fee', NULL),
('Premium', 'Enhanced listing with premium features', 999.00, 'flat_fee', NULL),
('Commission', 'Pay only when you sell', 0.00, 'commission', 1.50),
('Enterprise', 'For agencies and developers', 299.00, 'subscription', NULL);

-- =============================================
-- CORE TABLES
-- =============================================

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- User Roles Junction Table (4NF: Separates multi-valued dependency)
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_user_role (user_id, role_id)
);

-- User Sessions Table
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at)
);

-- Properties Table
CREATE TABLE properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    
    -- Location
    street_address VARCHAR(255) NOT NULL,
    unit_number VARCHAR(20),
    suburb_id INT NOT NULL,
    
    -- Property Details
    property_type_id INT NOT NULL,
    status_id INT NOT NULL DEFAULT 1,
    
    -- Specifications
    bedrooms TINYINT UNSIGNED NOT NULL DEFAULT 0,
    bathrooms TINYINT UNSIGNED NOT NULL DEFAULT 0,
    car_spaces TINYINT UNSIGNED NOT NULL DEFAULT 0,
    land_size INT UNSIGNED,
    building_size INT UNSIGNED,
    year_built YEAR,
    
    -- Pricing
    price DECIMAL(12, 2),
    price_display VARCHAR(100),
    is_price_hidden BOOLEAN DEFAULT FALSE,
    
    -- AI Data
    ai_valuation_low DECIMAL(12, 2),
    ai_valuation_mid DECIMAL(12, 2),
    ai_valuation_high DECIMAL(12, 2),
    ai_demand_score DECIMAL(3, 1),
    ai_valuation_updated_at TIMESTAMP NULL,
    
    -- Content
    headline VARCHAR(255),
    description TEXT,
    
    -- Stats
    views_count INT UNSIGNED DEFAULT 0,
    enquiries_count INT UNSIGNED DEFAULT 0,
    saves_count INT UNSIGNED DEFAULT 0,
    
    -- Billing
    billing_plan_id INT,
    
    -- Timestamps
    listed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    sold_at TIMESTAMP NULL,
    sold_price DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (suburb_id) REFERENCES suburbs(id),
    FOREIGN KEY (property_type_id) REFERENCES property_types(id),
    FOREIGN KEY (status_id) REFERENCES property_statuses(id),
    FOREIGN KEY (billing_plan_id) REFERENCES billing_plans(id),
    
    INDEX idx_seller (seller_id),
    INDEX idx_suburb (suburb_id),
    INDEX idx_status (status_id),
    INDEX idx_price (price),
    INDEX idx_bedrooms (bedrooms),
    INDEX idx_listed (listed_at),
    FULLTEXT idx_search (headline, description)
);

-- Property Images Table (4NF: Separates multi-valued image dependency)
CREATE TABLE property_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(255),
    display_order TINYINT UNSIGNED DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_primary (property_id, is_primary)
);

-- Property Features Junction Table (4NF: Separates multi-valued feature dependency)
CREATE TABLE property_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    feature_id INT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (feature_id) REFERENCES features(id),
    UNIQUE KEY unique_property_feature (property_id, feature_id)
);

-- Saved Properties Junction Table (4NF: Separates multi-valued saved dependency)
CREATE TABLE saved_properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved (user_id, property_id),
    INDEX idx_user (user_id)
);

-- =============================================
-- OFFERS TABLES
-- =============================================

-- Offers Table
CREATE TABLE offers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    buyer_id INT NOT NULL,
    
    -- Offer Details
    offer_amount DECIMAL(12, 2) NOT NULL,
    deposit_amount DECIMAL(12, 2),
    
    -- Finance
    finance_type ENUM('cash', 'pre-approved', 'subject_to_finance') NOT NULL,
    finance_amount DECIMAL(12, 2),
    finance_lender VARCHAR(100),
    
    -- Settlement
    settlement_days INT UNSIGNED DEFAULT 30,
    proposed_settlement_date DATE,
    
    -- Status
    status_id INT NOT NULL DEFAULT 1,
    
    -- Counter Offer
    is_counter_offer BOOLEAN DEFAULT FALSE,
    parent_offer_id INT NULL,
    counter_amount DECIMAL(12, 2),
    
    -- AI Analysis
    ai_confidence_score DECIMAL(3, 1),
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed_at TIMESTAMP NULL,
    responded_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (status_id) REFERENCES offer_statuses(id),
    FOREIGN KEY (parent_offer_id) REFERENCES offers(id),
    
    INDEX idx_property (property_id),
    INDEX idx_buyer (buyer_id),
    INDEX idx_status (status_id)
);

-- Offer Conditions Table (4NF: Separates multi-valued conditions dependency)
CREATE TABLE offer_conditions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    condition_type VARCHAR(100) NOT NULL,
    description TEXT,
    is_satisfied BOOLEAN DEFAULT FALSE,
    satisfied_at TIMESTAMP NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    INDEX idx_offer (offer_id)
);

-- =============================================
-- INSPECTIONS TABLES
-- =============================================

-- Inspections Table
CREATE TABLE inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    
    -- Type
    inspection_type ENUM('open_home', 'private', 'virtual') NOT NULL,
    
    -- Schedule
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Details
    max_attendees INT UNSIGNED,
    notes TEXT,
    
    -- Status
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    cancelled_reason VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES properties(id),
    INDEX idx_property (property_id),
    INDEX idx_date (scheduled_date),
    INDEX idx_status (status)
);

-- Inspection Attendees Table (4NF: Separates multi-valued attendee dependency)
CREATE TABLE inspection_attendees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inspection_id INT NOT NULL,
    user_id INT NOT NULL,
    
    -- Booking Details
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    
    -- Feedback
    interest_level TINYINT UNSIGNED,
    comments TEXT,
    
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_booking (inspection_id, user_id)
);

-- =============================================
-- DOCUMENTS TABLES
-- =============================================

-- Documents Table
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    document_type_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    
    -- File Details
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED,
    mime_type VARCHAR(100),
    
    -- Status
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    rejection_reason VARCHAR(255),
    
    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (document_type_id) REFERENCES document_types(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    
    INDEX idx_property (property_id),
    INDEX idx_type (document_type_id),
    INDEX idx_status (status)
);

-- Document Shares Table (4NF: Separates multi-valued sharing dependency)
CREATE TABLE document_shares (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    shared_with_user_id INT NOT NULL,
    shared_by_user_id INT NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES users(id),
    FOREIGN KEY (shared_by_user_id) REFERENCES users(id),
    UNIQUE KEY unique_share (document_id, shared_with_user_id)
);

-- =============================================
-- MESSAGING TABLES
-- =============================================

-- Conversations Table
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NULL,
    subject VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    INDEX idx_property (property_id)
);

-- Conversation Participants (4NF: Separates multi-valued participant dependency)
CREATE TABLE conversation_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP NULL,
    is_muted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_participant (conversation_id, user_id)
);

-- Messages Table
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    
    -- Content
    content TEXT NOT NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    -- Timestamps
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP NULL,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_sent (sent_at)
);

-- Message Attachments Table (4NF: Separates multi-valued attachment dependency)
CREATE TABLE message_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- =============================================
-- BILLING TABLES
-- =============================================

-- Billing Transactions Table
CREATE TABLE billing_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    property_id INT NULL,
    billing_plan_id INT NOT NULL,
    
    -- Transaction Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AUD',
    
    -- Payment
    payment_method ENUM('card', 'bank_transfer', 'paypal') NOT NULL,
    payment_reference VARCHAR(255),
    
    -- Status
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (billing_plan_id) REFERENCES billing_plans(id),
    
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- =============================================
-- SYSTEM TABLES
-- =============================================

-- Notifications Table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    
    -- Content
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    
    -- Link
    action_url VARCHAR(500),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (user_id, is_read),
    INDEX idx_created (created_at)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    
    -- Action
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    
    -- Details
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Active Listings View
CREATE OR REPLACE VIEW vw_active_listings AS
SELECT 
    p.id,
    p.headline,
    p.street_address,
    p.unit_number,
    s.name AS suburb,
    st.code AS state,
    s.postcode,
    pt.name AS property_type,
    ps.name AS status,
    p.bedrooms,
    p.bathrooms,
    p.car_spaces,
    p.land_size,
    p.building_size,
    p.price,
    p.price_display,
    p.ai_valuation_mid,
    p.ai_demand_score,
    p.views_count,
    p.listed_at,
    CONCAT(u.first_name, ' ', u.last_name) AS seller_name,
    u.email AS seller_email
FROM properties p
JOIN suburbs s ON p.suburb_id = s.id
JOIN states st ON s.state_id = st.id
JOIN property_types pt ON p.property_type_id = pt.id
JOIN property_statuses ps ON p.status_id = ps.id
JOIN users u ON p.seller_id = u.id
WHERE ps.name = 'live';

-- Property Search View
CREATE OR REPLACE VIEW vw_property_search AS
SELECT 
    p.id,
    p.headline,
    p.street_address,
    s.name AS suburb,
    st.code AS state,
    s.postcode,
    pt.name AS property_type,
    p.bedrooms,
    p.bathrooms,
    p.car_spaces,
    p.price,
    p.ai_valuation_mid,
    pi.url AS primary_image,
    p.listed_at
FROM properties p
JOIN suburbs s ON p.suburb_id = s.id
JOIN states st ON s.state_id = st.id
JOIN property_types pt ON p.property_type_id = pt.id
JOIN property_statuses ps ON p.status_id = ps.id
LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_primary = TRUE
WHERE ps.name = 'live';

-- =============================================
-- STORED PROCEDURES
-- =============================================

DELIMITER //

-- Procedure: Record Property View
CREATE PROCEDURE sp_record_property_view(IN p_property_id INT)
BEGIN
    UPDATE properties 
    SET views_count = views_count + 1 
    WHERE id = p_property_id;
END //

-- Procedure: Save Property for User
CREATE PROCEDURE sp_save_property(IN p_user_id INT, IN p_property_id INT)
BEGIN
    INSERT IGNORE INTO saved_properties (user_id, property_id)
    VALUES (p_user_id, p_property_id);
    
    UPDATE properties 
    SET saves_count = saves_count + 1 
    WHERE id = p_property_id;
END //

-- Procedure: Submit Offer
CREATE PROCEDURE sp_submit_offer(
    IN p_property_id INT,
    IN p_buyer_id INT,
    IN p_offer_amount DECIMAL(12,2),
    IN p_finance_type VARCHAR(20),
    IN p_settlement_days INT
)
BEGIN
    DECLARE v_status_id INT;
    
    SELECT id INTO v_status_id FROM offer_statuses WHERE name = 'pending';
    
    INSERT INTO offers (property_id, buyer_id, offer_amount, finance_type, settlement_days, status_id)
    VALUES (p_property_id, p_buyer_id, p_offer_amount, p_finance_type, p_settlement_days, v_status_id);
    
    UPDATE properties 
    SET enquiries_count = enquiries_count + 1 
    WHERE id = p_property_id;
    
    SELECT LAST_INSERT_ID() AS offer_id;
END //

DELIMITER ;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert demo user
INSERT INTO users (email, password_hash, first_name, last_name, phone, email_verified, is_active)
VALUES ('demo@ai-re.com.au', '$2b$10$placeholder', 'Demo', 'User', '0400 000 000', TRUE, TRUE);

-- Assign buyer role to demo user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email = 'demo@ai-re.com.au' AND r.name = 'buyer';

-- Insert some sample suburbs
INSERT INTO suburbs (name, postcode, state_id, latitude, longitude) VALUES
('Sydney', '2000', 1, -33.8688, 151.2093),
('Mosman', '2088', 1, -33.8269, 151.2466),
('Bondi Beach', '2026', 1, -33.8915, 151.2767),
('Melbourne', '3000', 2, -37.8136, 144.9631),
('Toorak', '3142', 2, -37.8406, 145.0186),
('Brisbane', '4000', 3, -27.4698, 153.0251),
('Surfers Paradise', '4217', 3, -28.0027, 153.4299),
('Perth', '6000', 4, -31.9505, 115.8605);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Additional compound indexes for common queries
CREATE INDEX idx_properties_search ON properties (status_id, suburb_id, property_type_id, price);
CREATE INDEX idx_properties_seller_status ON properties (seller_id, status_id);
CREATE INDEX idx_offers_property_status ON offers (property_id, status_id);
CREATE INDEX idx_inspections_date_status ON inspections (scheduled_date, status);
