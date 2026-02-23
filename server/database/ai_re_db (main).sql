-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 
-- Generation Time: Feb 22, 2026 at 05:17 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ai_re_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cleanup_expired_verifications` ()   BEGIN
    DELETE FROM email_verifications 
    WHERE expires_at < NOW();
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_record_property_view` (IN `p_property_id` INT)   BEGIN
    UPDATE properties 
    SET views_count = views_count + 1 
    WHERE id = p_property_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_property` (IN `p_user_id` INT, IN `p_property_id` INT)   BEGIN
    INSERT IGNORE INTO saved_properties (user_id, property_id)
    VALUES (p_user_id, p_property_id);
    
    UPDATE properties 
    SET saves_count = saves_count + 1 
    WHERE id = p_property_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_submit_offer` (IN `p_property_id` INT, IN `p_buyer_id` INT, IN `p_offer_amount` DECIMAL(12,2), IN `p_finance_type` VARCHAR(20), IN `p_settlement_days` INT)   BEGIN
    DECLARE v_status_id INT;
    
    SELECT id INTO v_status_id FROM offer_statuses WHERE name = 'pending';
    
    INSERT INTO offers (property_id, buyer_id, offer_amount, finance_type, settlement_days, status_id)
    VALUES (p_property_id, p_buyer_id, p_offer_amount, p_finance_type, p_settlement_days, v_status_id);
    
    UPDATE properties 
    SET enquiries_count = enquiries_count + 1 
    WHERE id = p_property_id;
    
    SELECT LAST_INSERT_ID() AS offer_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `ai_property_insights`
--

CREATE TABLE `ai_property_insights` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `estimated_min` decimal(12,2) DEFAULT NULL,
  `estimated_max` decimal(12,2) DEFAULT NULL,
  `demand_score` decimal(4,1) DEFAULT NULL,
  `predicted_days_on_market` int(11) DEFAULT NULL,
  `similarity_match` int(11) DEFAULT NULL,
  `live_traffic` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_property_insights`
--

INSERT INTO `ai_property_insights` (`id`, `property_id`, `estimated_min`, `estimated_max`, `demand_score`, `predicted_days_on_market`, `similarity_match`, `live_traffic`, `updated_at`) VALUES
(1, 1, 815000.00, 830000.00, 8.7, 14, 92, 3, '2026-02-02 23:28:17');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `billing_plans`
--

CREATE TABLE `billing_plans` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `billing_type` enum('flat_fee','commission','subscription') NOT NULL,
  `commission_rate` decimal(5,2) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `billing_plans`
--

INSERT INTO `billing_plans` (`id`, `name`, `description`, `price`, `billing_type`, `commission_rate`, `features`, `is_active`, `created_at`) VALUES
(1, 'Basic', 'Flat fee listing with essential features', 499.00, 'flat_fee', NULL, NULL, 1, '2026-02-02 23:28:16'),
(2, 'Premium', 'Enhanced listing with premium features', 999.00, 'flat_fee', NULL, NULL, 1, '2026-02-02 23:28:16'),
(3, 'Commission', 'Pay only when you sell', 0.00, 'commission', 1.50, NULL, 1, '2026-02-02 23:28:16'),
(4, 'Enterprise', 'For agencies and developers', 299.00, 'subscription', NULL, NULL, 1, '2026-02-02 23:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `billing_transactions`
--

CREATE TABLE `billing_transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `property_id` int(11) DEFAULT NULL,
  `billing_plan_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'AUD',
  `payment_method` enum('card','bank_transfer','paypal') NOT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` int(11) NOT NULL,
  `property_id` int(11) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversation_participants`
--

CREATE TABLE `conversation_participants` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_read_at` timestamp NULL DEFAULT NULL,
  `is_muted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `document_type_id` int(11) NOT NULL,
  `doc_type` enum('floorplan','brochure','contract','building_report') DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `property_id`, `document_type_id`, `doc_type`, `uploaded_by`, `file_name`, `file_url`, `file_size`, `mime_type`, `status`, `reviewed_by`, `reviewed_at`, `rejection_reason`, `uploaded_at`, `created_at`) VALUES
(1, 1, 3, 'floorplan', 1, 'floorplan.pdf', 'https://via.placeholder.com/1000x600', NULL, NULL, 'pending', NULL, NULL, NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17'),
(2, 1, 8, 'brochure', 1, 'brochure.pdf', '#', NULL, NULL, 'pending', NULL, NULL, NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17'),
(3, 1, 1, 'contract', 1, 'contract.pdf', '#', NULL, NULL, 'pending', NULL, NULL, NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17');

-- --------------------------------------------------------

--
-- Table structure for table `document_shares`
--

CREATE TABLE `document_shares` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `shared_with_user_id` int(11) NOT NULL,
  `shared_by_user_id` int(11) NOT NULL,
  `shared_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_types`
--

CREATE TABLE `document_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `required_for_listing` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_types`
--

INSERT INTO `document_types` (`id`, `name`, `description`, `required_for_listing`, `created_at`) VALUES
(1, 'Contract of Sale', 'Legal contract document', 1, '2026-02-02 23:28:16'),
(2, 'Title', 'Property title certificate', 1, '2026-02-02 23:28:16'),
(3, 'Floor Plan', 'Property floor plan', 0, '2026-02-02 23:28:16'),
(4, 'Building Report', 'Building inspection report', 0, '2026-02-02 23:28:16'),
(5, 'Pest Report', 'Pest inspection report', 0, '2026-02-02 23:28:16'),
(6, 'Strata Report', 'Strata inspection report (for units)', 0, '2026-02-02 23:28:16'),
(7, 'ID Document', 'Seller identification', 1, '2026-02-02 23:28:16'),
(8, 'Brochure', 'Marketing brochure', 0, '2026-02-02 23:28:16'),
(9, 'Photos', 'Property photos', 1, '2026-02-02 23:28:16'),
(10, 'Energy Rating', 'Energy efficiency certificate', 0, '2026-02-02 23:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `resend_available_at` datetime NOT NULL,
  `attempt_count` int(11) DEFAULT 0,
  `payload_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_verifications`
--

INSERT INTO `email_verifications` (`id`, `email`, `code_hash`, `expires_at`, `resend_available_at`, `attempt_count`, `payload_json`, `created_at`, `updated_at`) VALUES
(6, 'ghostzyroyt2026@gmail.com', '$2b$12$b3aYYRilY4VDUZzxCyq3JerUsCqInlJ/aF4tRJeGRuEoZi5iiVSBK', '2026-02-20 18:56:11', '2026-02-20 18:47:11', 1, '{\"firstName\":\"Jheys\",\"lastName\":\"Pile\",\"username\":\"jheyspile\",\"address\":\"qweqweq\",\"suburb\":\"as\",\"postcode\":\"3996\",\"mobile\":\"0461873522\",\"email\":\"ghostzyroyt2026@gmail.com\",\"password\":\"$Russel123\"}', '2026-02-20 10:45:50', '2026-02-20 10:46:17');

-- --------------------------------------------------------

--
-- Table structure for table `enquiries`
--

CREATE TABLE `enquiries` (
  `id` int(11) NOT NULL,
  `property_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `source` enum('request_info','ask_aiva','contact_agent') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `features`
--

CREATE TABLE `features` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `features`
--

INSERT INTO `features` (`id`, `name`, `category`, `icon`, `created_at`) VALUES
(1, 'Air Conditioning', 'Climate', 'ac_unit', '2026-02-02 23:28:16'),
(2, 'Heating', 'Climate', 'heat', '2026-02-02 23:28:16'),
(3, 'Swimming Pool', 'Outdoor', 'pool', '2026-02-02 23:28:16'),
(4, 'Garden', 'Outdoor', 'yard', '2026-02-02 23:28:16'),
(5, 'Garage', 'Parking', 'garage', '2026-02-02 23:28:16'),
(6, 'Carport', 'Parking', 'car', '2026-02-02 23:28:16'),
(7, 'Balcony', 'Outdoor', 'balcony', '2026-02-02 23:28:16'),
(8, 'Deck', 'Outdoor', 'deck', '2026-02-02 23:28:16'),
(9, 'Dishwasher', 'Kitchen', 'dishwasher', '2026-02-02 23:28:16'),
(10, 'Built-in Wardrobes', 'Interior', 'wardrobe', '2026-02-02 23:28:16'),
(11, 'Floorboards', 'Interior', 'floor', '2026-02-02 23:28:16'),
(12, 'Alarm System', 'Security', 'security', '2026-02-02 23:28:16'),
(13, 'Intercom', 'Security', 'intercom', '2026-02-02 23:28:16'),
(14, 'Solar Panels', 'Energy', 'solar', '2026-02-02 23:28:16'),
(15, 'Solar Ready', 'Energy', 'solar', '2026-02-02 23:28:16'),
(16, 'Energy Efficient', 'Energy', 'energy', '2026-02-02 23:28:16'),
(17, 'Study', 'Interior', 'study', '2026-02-02 23:28:16'),
(18, 'Ensuite', 'Bathroom', 'bathroom', '2026-02-02 23:28:16'),
(19, 'Walk-in Robe', 'Interior', 'wardrobe', '2026-02-02 23:28:16'),
(20, 'Fireplace', 'Climate', 'fireplace', '2026-02-02 23:28:16'),
(21, 'Outdoor Entertaining', 'Outdoor', 'outdoor', '2026-02-02 23:28:16'),
(22, 'Water Tank', 'Sustainability', 'water', '2026-02-02 23:28:16'),
(23, 'Shed', 'Outdoor', 'shed', '2026-02-02 23:28:16'),
(24, 'Tennis Court', 'Recreation', 'tennis', '2026-02-02 23:28:16'),
(25, 'Gym', 'Recreation', 'gym', '2026-02-02 23:28:16'),
(26, 'Spa', 'Recreation', 'spa', '2026-02-02 23:28:16'),
(27, 'City Views', 'Views', 'view', '2026-02-02 23:28:16'),
(28, 'Water Views', 'Views', 'water_view', '2026-02-02 23:28:16'),
(29, 'Renovated', 'Condition', 'renovated', '2026-02-02 23:28:16'),
(30, 'Large Backyard', 'Outdoor', 'yard', '2026-02-02 23:28:16'),
(31, 'Medium Backyard', 'Outdoor', 'yard', '2026-02-02 23:28:16'),
(32, 'Cozy Backyard', 'Outdoor', 'yard', '2026-02-02 23:28:16'),
(33, 'Huge Backyard', 'Outdoor', 'yard', '2026-02-02 23:28:16'),
(34, 'Spacious Backyard', 'Outdoor', 'yard', '2026-02-02 23:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `inspections`
--

CREATE TABLE `inspections` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `inspection_type` enum('open_home','private','virtual') NOT NULL,
  `scheduled_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `start_datetime` datetime DEFAULT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `max_attendees` int(10) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `cancelled_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections`
--

INSERT INTO `inspections` (`id`, `property_id`, `inspection_type`, `scheduled_date`, `start_time`, `end_time`, `start_datetime`, `end_datetime`, `max_attendees`, `notes`, `status`, `cancelled_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 'open_home', '2026-02-08', '12:30:00', '13:00:00', '2026-02-08 12:30:00', '2026-02-08 13:00:00', NULL, NULL, 'scheduled', NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17'),
(2, 1, 'open_home', '2026-02-09', '10:00:00', '10:30:00', '2026-02-09 10:00:00', '2026-02-09 10:30:00', NULL, NULL, 'scheduled', NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17');

-- --------------------------------------------------------

--
-- Table structure for table `inspection_attendees`
--

CREATE TABLE `inspection_attendees` (
  `id` int(11) NOT NULL,
  `inspection_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `attended` tinyint(1) DEFAULT 0,
  `interest_level` tinyint(3) UNSIGNED DEFAULT NULL,
  `comments` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_contact`
--

CREATE TABLE `lead_contact` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_ai_generated` tinyint(1) DEFAULT 0,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `edited_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_attachments`
--

CREATE TABLE `message_attachments` (
  `id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(500) NOT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `action_url` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `offer_amount` decimal(12,2) NOT NULL,
  `deposit_amount` decimal(12,2) DEFAULT NULL,
  `finance_type` enum('cash','pre-approved','subject_to_finance') DEFAULT NULL,
  `finance_amount` decimal(12,2) DEFAULT NULL,
  `finance_lender` varchar(100) DEFAULT NULL,
  `settlement_days` int(10) UNSIGNED DEFAULT 30,
  `proposed_settlement_date` date DEFAULT NULL,
  `status_id` int(11) NOT NULL DEFAULT 1,
  `status` enum('pending','accepted','rejected','withdrawn') DEFAULT 'pending',
  `is_counter_offer` tinyint(1) DEFAULT 0,
  `parent_offer_id` int(11) DEFAULT NULL,
  `counter_amount` decimal(12,2) DEFAULT NULL,
  `ai_confidence_score` decimal(3,1) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `viewed_at` timestamp NULL DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `offer_conditions`
--

CREATE TABLE `offer_conditions` (
  `id` int(11) NOT NULL,
  `offer_id` int(11) NOT NULL,
  `condition_type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_satisfied` tinyint(1) DEFAULT 0,
  `satisfied_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `offer_statuses`
--

CREATE TABLE `offer_statuses` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offer_statuses`
--

INSERT INTO `offer_statuses` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'pending', 'Offer submitted, awaiting response', '2026-02-02 23:28:16'),
(2, 'viewed', 'Offer has been viewed by seller', '2026-02-02 23:28:16'),
(3, 'countered', 'Counter offer made', '2026-02-02 23:28:16'),
(4, 'accepted', 'Offer accepted', '2026-02-02 23:28:16'),
(5, 'rejected', 'Offer rejected', '2026-02-02 23:28:16'),
(6, 'withdrawn', 'Offer withdrawn by buyer', '2026-02-02 23:28:16'),
(7, 'expired', 'Offer expired', '2026-02-02 23:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `street_address` varchar(255) NOT NULL,
  `unit_number` varchar(20) DEFAULT NULL,
  `suburb_id` int(11) NOT NULL,
  `property_type_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL DEFAULT 1,
  `bedrooms` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `bathrooms` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `car_spaces` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `land_size` int(10) UNSIGNED DEFAULT NULL,
  `building_size` int(10) UNSIGNED DEFAULT NULL,
  `year_built` year(4) DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `price_display` varchar(100) DEFAULT NULL,
  `price_min` decimal(12,2) DEFAULT NULL,
  `price_max` decimal(12,2) DEFAULT NULL,
  `price_type` enum('range','offers_above','eoi','fixed') DEFAULT 'range',
  `is_price_hidden` tinyint(1) DEFAULT 0,
  `ai_valuation_low` decimal(12,2) DEFAULT NULL,
  `ai_valuation_mid` decimal(12,2) DEFAULT NULL,
  `ai_valuation_high` decimal(12,2) DEFAULT NULL,
  `ai_demand_score` decimal(3,1) DEFAULT NULL,
  `ai_valuation_updated_at` timestamp NULL DEFAULT NULL,
  `headline` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ai_summary` text DEFAULT NULL,
  `views_count` int(10) UNSIGNED DEFAULT 0,
  `enquiries_count` int(10) UNSIGNED DEFAULT 0,
  `saves_count` int(10) UNSIGNED DEFAULT 0,
  `billing_plan_id` int(11) DEFAULT NULL,
  `is_sponsored` tinyint(1) DEFAULT 0,
  `commute_time` int(11) DEFAULT NULL,
  `energy_rating` varchar(50) DEFAULT NULL,
  `listed_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `sold_at` timestamp NULL DEFAULT NULL,
  `sold_price` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `properties`
--

INSERT INTO `properties` (`id`, `seller_id`, `street_address`, `unit_number`, `suburb_id`, `property_type_id`, `status_id`, `bedrooms`, `bathrooms`, `car_spaces`, `land_size`, `building_size`, `year_built`, `price`, `price_display`, `price_min`, `price_max`, `price_type`, `is_price_hidden`, `ai_valuation_low`, `ai_valuation_mid`, `ai_valuation_high`, `ai_demand_score`, `ai_valuation_updated_at`, `headline`, `title`, `description`, `ai_summary`, `views_count`, `enquiries_count`, `saves_count`, `billing_plan_id`, `is_sponsored`, `commute_time`, `energy_rating`, `listed_at`, `expires_at`, `sold_at`, `sold_price`, `created_at`, `updated_at`) VALUES
(1, 1, '46 Ellis Road', NULL, 1, 1, 3, 3, 1, 2, 1012, NULL, NULL, 824500.00, '$799,000 – $850,000', 799000.00, 850000.00, 'range', 0, NULL, NULL, NULL, NULL, NULL, 'Relaxed Hills Living with Views, Space & Privacy', 'Relaxed Hills Living with Views, Space & Privacy', 'A charming family home on a quiet cul-de-sac, recently updated kitchen, large backyard ideal for families and entertaining.', 'AIVA generated summary', 0, 0, 0, NULL, 0, 5, 'Energy Efficient', '2026-02-02 23:28:17', NULL, NULL, NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17'),
(2, 2, '123 Main St', NULL, 2, 1, 3, 3, 2, 2, NULL, NULL, NULL, 720000.00, '$720,000', 720000.00, 720000.00, 'fixed', 0, NULL, NULL, NULL, NULL, NULL, 'Modern Family Home', 'Modern Family Home', 'Spacious home in Hobart', 'AIVA summary', 0, 0, 0, NULL, 0, 7, 'Solar Ready', '2026-02-02 23:28:17', NULL, NULL, NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17'),
(3, 3, '456 Swan Rd', NULL, 3, 1, 3, 5, 3, 3, NULL, NULL, NULL, 2350000.00, '$2,350,000', 2350000.00, 2350000.00, 'fixed', 0, NULL, NULL, NULL, NULL, NULL, 'Luxury Perth Residence', 'Luxury Perth Residence', 'Luxurious residence in Perth', 'AIVA summary', 0, 0, 0, NULL, 0, 2, 'Solar Ready', '2026-02-02 23:28:17', NULL, NULL, NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17'),
(4, 2, '789 Adelaide St', NULL, 5, 1, 3, 2, 1, 1, NULL, NULL, NULL, 560000.00, '$560,000', 560000.00, 560000.00, 'fixed', 0, NULL, NULL, NULL, NULL, NULL, 'Cozy Adelaide Cottage', 'Cozy Adelaide Cottage', 'Charming cottage in Adelaide', 'AIVA summary', 0, 0, 0, NULL, 0, 5, 'Energy Efficient', '2026-02-02 23:28:17', NULL, NULL, NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17'),
(5, 3, '12 Newstead Ave', NULL, 4, 1, 3, 4, 2, 2, NULL, NULL, NULL, 1480000.00, '$1,480,000', 1480000.00, 1480000.00, 'fixed', 0, NULL, NULL, NULL, NULL, NULL, 'Newstead Family Home', 'Newstead Family Home', 'Spacious family home in Newstead', 'AIVA summary', 0, 0, 0, NULL, 0, 5, 'Solar Ready', '2026-02-02 23:28:17', NULL, NULL, NULL, '2026-02-02 23:28:17', '2026-02-02 23:28:17');

-- --------------------------------------------------------

--
-- Table structure for table `property_features`
--

CREATE TABLE `property_features` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `feature_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property_images`
--

CREATE TABLE `property_images` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `display_order` tinyint(3) UNSIGNED DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_images`
--

INSERT INTO `property_images` (`id`, `property_id`, `url`, `thumbnail_url`, `alt_text`, `display_order`, `is_primary`, `sort_order`, `is_featured`, `uploaded_at`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600', NULL, NULL, 1, 1, 1, 1, '2026-02-02 23:28:17'),
(2, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600', NULL, NULL, 2, 0, 2, 0, '2026-02-02 23:28:17'),
(3, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600', NULL, NULL, 3, 0, 3, 0, '2026-02-02 23:28:17'),
(4, 2, 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200', NULL, NULL, 1, 1, 1, 1, '2026-02-02 23:28:17'),
(5, 3, 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200', NULL, NULL, 1, 1, 1, 1, '2026-02-02 23:28:17'),
(6, 4, 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200', NULL, NULL, 1, 1, 1, 1, '2026-02-02 23:28:17'),
(7, 5, 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200', NULL, NULL, 1, 1, 1, 1, '2026-02-02 23:28:17');

-- --------------------------------------------------------

--
-- Table structure for table `property_statuses`
--

CREATE TABLE `property_statuses` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `display_color` varchar(7) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_statuses`
--

INSERT INTO `property_statuses` (`id`, `name`, `description`, `display_color`, `created_at`) VALUES
(1, 'draft', 'Property listing in draft mode', '#6b7280', '2026-02-02 23:28:16'),
(2, 'pending_approval', 'Awaiting admin approval', '#f59e0b', '2026-02-02 23:28:16'),
(3, 'active', 'Active listing visible to buyers', '#10b981', '2026-02-02 23:28:16'),
(4, 'new', 'New listing', '#14b8a6', '2026-02-02 23:28:16'),
(5, 'premium', 'Premium featured listing', '#8b5cf6', '2026-02-02 23:28:16'),
(6, 'under_offer', 'Offer accepted, pending settlement', '#3b82f6', '2026-02-02 23:28:16'),
(7, 'sold', 'Property has been sold', '#059669', '2026-02-02 23:28:16'),
(8, 'withdrawn', 'Listing withdrawn by seller', '#ef4444', '2026-02-02 23:28:16'),
(9, 'expired', 'Listing has expired', '#9ca3af', '2026-02-02 23:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `property_types`
--

CREATE TABLE `property_types` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_types`
--

INSERT INTO `property_types` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'House', 'Standalone residential house', '2026-02-02 23:28:16'),
(2, 'Apartment', 'Unit in an apartment complex', '2026-02-02 23:28:16'),
(3, 'Townhouse', 'Multi-level attached housing', '2026-02-02 23:28:16'),
(4, 'Villa', 'Single-level attached housing', '2026-02-02 23:28:16'),
(5, 'Land', 'Vacant land', '2026-02-02 23:28:16'),
(6, 'Rural', 'Rural/farming property', '2026-02-02 23:28:16'),
(7, 'Commercial', 'Commercial property', '2026-02-02 23:28:16'),
(8, 'Brick Home', 'Brick constructed home', '2026-02-02 23:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'buyer', 'Property buyer/searcher', '2026-02-02 23:28:16'),
(2, 'seller', 'Property seller/owner', '2026-02-02 23:28:16'),
(3, 'admin', 'System administrator', '2026-02-02 23:28:16'),
(4, 'agent', 'Oakford Realty support agent', '2026-02-02 23:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `saved_properties`
--

CREATE TABLE `saved_properties` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saved_properties`
--

INSERT INTO `saved_properties` (`id`, `user_id`, `property_id`, `saved_at`, `notes`) VALUES
(1, 2, 1, '2026-02-02 23:28:17', NULL),
(2, 3, 1, '2026-02-02 23:28:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `schools_nearby`
--

CREATE TABLE `schools_nearby` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `school_name` varchar(255) DEFAULT NULL,
  `distance_km` decimal(5,2) DEFAULT NULL,
  `drive_minutes` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schools_nearby`
--

INSERT INTO `schools_nearby` (`id`, `property_id`, `school_name`, `distance_km`, `drive_minutes`) VALUES
(1, 1, 'Mount Nasura Primary School', 1.20, 5),
(2, 1, 'Hills High School', 3.40, 8);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `session_id` varchar(128) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `valid` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `session_id`, `user_id`, `user_agent`, `ip_address`, `expires_at`, `valid`, `created_at`) VALUES
(121, '0f688d324491a19978e27167d9d8358249641e0be5c17cf4ccfb322ca2d1b538', 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '::1', '2026-02-23 11:32:11', 1, '2026-02-22 03:32:11');

-- --------------------------------------------------------

--
-- Table structure for table `similar_properties`
--

CREATE TABLE `similar_properties` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `similar_property_id` int(11) NOT NULL,
  `score` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `similar_properties`
--

INSERT INTO `similar_properties` (`id`, `property_id`, `similar_property_id`, `score`) VALUES
(1, 1, 2, 80),
(2, 1, 3, 70),
(3, 1, 4, 60),
(4, 1, 5, 85);

-- --------------------------------------------------------

--
-- Table structure for table `states`
--

CREATE TABLE `states` (
  `id` int(11) NOT NULL,
  `code` varchar(3) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `states`
--

INSERT INTO `states` (`id`, `code`, `name`, `created_at`) VALUES
(1, 'NSW', 'New South Wales', '2026-02-02 23:28:16'),
(2, 'VIC', 'Victoria', '2026-02-02 23:28:16'),
(3, 'QLD', 'Queensland', '2026-02-02 23:28:16'),
(4, 'WA', 'Western Australia', '2026-02-02 23:28:16'),
(5, 'SA', 'South Australia', '2026-02-02 23:28:16'),
(6, 'TAS', 'Tasmania', '2026-02-02 23:28:16'),
(7, 'ACT', 'Australian Capital Territory', '2026-02-02 23:28:16'),
(8, 'NT', 'Northern Territory', '2026-02-02 23:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `suburbs`
--

CREATE TABLE `suburbs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `postcode` varchar(4) NOT NULL,
  `state_id` int(11) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suburbs`
--

INSERT INTO `suburbs` (`id`, `name`, `postcode`, `state_id`, `latitude`, `longitude`, `created_at`) VALUES
(1, 'Mount Nasura', '6112', 4, -31.95350000, 115.85700000, '2026-02-02 23:28:17'),
(2, 'Hobart', '7000', 6, -42.88000000, 147.32000000, '2026-02-02 23:28:17'),
(3, 'Perth', '6000', 4, -31.95000000, 115.86000000, '2026-02-02 23:28:17'),
(4, 'Newstead', '4006', 3, -27.45000000, 153.04000000, '2026-02-02 23:28:17'),
(5, 'Adelaide', '5000', 5, -34.93000000, 138.60000000, '2026-02-02 23:28:17'),
(6, 'Baldivis', '6171', 4, -32.33000000, 115.82000000, '2026-02-02 23:28:17'),
(7, 'Alexander Heights', '6064', 4, -31.83000000, 115.86000000, '2026-02-02 23:28:17');

-- --------------------------------------------------------

--
-- Table structure for table `suburb_insights`
--

CREATE TABLE `suburb_insights` (
  `id` int(11) NOT NULL,
  `suburb_id` int(11) NOT NULL,
  `median_price` decimal(12,2) DEFAULT NULL,
  `median_rent` decimal(12,2) DEFAULT NULL,
  `rental_yield` decimal(5,2) DEFAULT NULL,
  `trend_30day` decimal(5,2) DEFAULT NULL,
  `trend_90day` decimal(5,2) DEFAULT NULL,
  `days_on_market` int(11) DEFAULT NULL,
  `demand_index` decimal(4,2) DEFAULT NULL,
  `predicted_activity` enum('Lower','Stable','Increased') DEFAULT NULL,
  `buyer_heatmap` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `school_zones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `ai_summary` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suburb_insights`
--

INSERT INTO `suburb_insights` (`id`, `suburb_id`, `median_price`, `median_rent`, `rental_yield`, `trend_30day`, `trend_90day`, `days_on_market`, `demand_index`, `predicted_activity`, `buyer_heatmap`, `school_zones`, `ai_summary`, `updated_at`) VALUES
(1, 6, 612000.00, 580.00, 4.93, 2.40, 4.80, 46, 8.70, 'Increased', NULL, NULL, 'Baldivis, WA 6171 is experiencing a strong market with a median house price of $612,000. Prices have increased 2.4% over the last month, with high buyer interest (AI demand: 8.7/10).', '2026-02-02 23:28:17'),
(2, 1, 645000.00, 520.00, 4.19, 2.80, 5.10, 41, 8.20, 'Increased', NULL, NULL, 'Mount Nasura, WA 6112 shows a growing market with a median house price of $645,000 and a 2.8% price increase over the past month.', '2026-02-02 23:28:17'),
(3, 2, 820000.00, 620.00, 3.93, 1.50, 2.10, 55, 7.30, 'Stable', NULL, NULL, 'Hobart, TAS 7000 is a stable market with a median house price of $820,000.', '2026-02-02 23:28:17'),
(4, 4, 1450000.00, 760.00, 2.72, 2.20, 3.10, 38, 9.10, 'Increased', NULL, NULL, 'Newstead, QLD 4006 has a strong and growing property market with a median price of $1,450,000.', '2026-02-02 23:28:17'),
(5, 5, 690000.00, 580.00, 4.37, 0.50, 1.40, 59, 6.90, 'Stable', NULL, NULL, 'Adelaide, SA 5000 maintains a stable market with a median price of $690,000.', '2026-02-02 23:28:17'),
(6, 3, 750000.00, 620.00, 4.29, 3.00, 5.30, 44, 8.90, 'Increased', NULL, NULL, 'Perth, WA 6000 continues to see increased activity with a median house price of $750,000.', '2026-02-02 23:28:17'),
(7, 7, 585000.00, 550.00, 4.89, 1.90, 3.60, 39, 8.30, 'Increased', NULL, NULL, 'Alexander Heights, WA 6064 shows a resilient suburban market with a median house price of $585,000.', '2026-02-02 23:28:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `suburb` varchar(100) DEFAULT NULL,
  `postcode` varchar(4) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password_hash`, `first_name`, `last_name`, `phone`, `address`, `suburb`, `postcode`, `mobile`, `avatar_url`, `email_verified`, `email_verified_at`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(5, 'admin@or.com.au', NULL, '$2b$12$q/Z7C1JXoSNMJnUV0nxMde/Fk36/0j6Nrfwaf7.feLFb1f3Nojy9W', 'Admin', 'User', '0412000555', NULL, NULL, NULL, NULL, NULL, 1, NULL, 1, '2026-02-22 03:32:11', '2026-02-02 23:28:17', '2026-02-22 03:32:11'),
(8, 'russelmcpe0320@gmail.com', NULL, '$2b$12$ZV85qvBThWnBwEiV.Bb6Uue78tu/pM52A/H8s1WANjDqJGfF4yMw6', 'rus', 'ss', '0461873522', NULL, NULL, NULL, NULL, NULL, 1, '2026-02-22 04:15:23', 1, NULL, '2026-02-22 04:15:23', '2026-02-22 04:15:23');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `assigned_at`, `assigned_by`) VALUES
(1, 1, 3, '2026-02-02 23:28:17', NULL),
(2, 2, 1, '2026-02-02 23:28:17', NULL),
(3, 3, 1, '2026-02-02 23:28:17', NULL),
(4, 4, 4, '2026-02-02 23:28:17', NULL),
(5, 5, 3, '2026-02-02 23:28:17', NULL),
(6, 6, 2, '2026-02-02 23:47:33', NULL),
(7, 7, 2, '2026-02-10 00:25:06', NULL),
(8, 8, 2, '2026-02-22 04:15:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_active_listings`
-- (See below for the actual view)
--
CREATE TABLE `vw_active_listings` (
`id` int(11)
,`headline` varchar(255)
,`street_address` varchar(255)
,`unit_number` varchar(20)
,`suburb` varchar(100)
,`state` varchar(3)
,`postcode` varchar(4)
,`property_type` varchar(50)
,`status` varchar(50)
,`bedrooms` tinyint(3) unsigned
,`bathrooms` tinyint(3) unsigned
,`car_spaces` tinyint(3) unsigned
,`land_size` int(10) unsigned
,`building_size` int(10) unsigned
,`price` decimal(12,2)
,`price_display` varchar(100)
,`ai_valuation_mid` decimal(12,2)
,`ai_demand_score` decimal(3,1)
,`views_count` int(10) unsigned
,`listed_at` timestamp
,`seller_name` varchar(201)
,`seller_email` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_property_search`
-- (See below for the actual view)
--
CREATE TABLE `vw_property_search` (
`id` int(11)
,`headline` varchar(255)
,`street_address` varchar(255)
,`suburb` varchar(100)
,`state` varchar(3)
,`postcode` varchar(4)
,`property_type` varchar(50)
,`bedrooms` tinyint(3) unsigned
,`bathrooms` tinyint(3) unsigned
,`car_spaces` tinyint(3) unsigned
,`price` decimal(12,2)
,`ai_valuation_mid` decimal(12,2)
,`primary_image` varchar(500)
,`listed_at` timestamp
);

-- --------------------------------------------------------

--
-- Structure for view `vw_active_listings`
--
DROP TABLE IF EXISTS `vw_active_listings`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_listings`  AS SELECT `p`.`id` AS `id`, `p`.`headline` AS `headline`, `p`.`street_address` AS `street_address`, `p`.`unit_number` AS `unit_number`, `s`.`name` AS `suburb`, `st`.`code` AS `state`, `s`.`postcode` AS `postcode`, `pt`.`name` AS `property_type`, `ps`.`name` AS `status`, `p`.`bedrooms` AS `bedrooms`, `p`.`bathrooms` AS `bathrooms`, `p`.`car_spaces` AS `car_spaces`, `p`.`land_size` AS `land_size`, `p`.`building_size` AS `building_size`, `p`.`price` AS `price`, `p`.`price_display` AS `price_display`, `p`.`ai_valuation_mid` AS `ai_valuation_mid`, `p`.`ai_demand_score` AS `ai_demand_score`, `p`.`views_count` AS `views_count`, `p`.`listed_at` AS `listed_at`, concat(`u`.`first_name`,' ',`u`.`last_name`) AS `seller_name`, `u`.`email` AS `seller_email` FROM (((((`properties` `p` join `suburbs` `s` on(`p`.`suburb_id` = `s`.`id`)) join `states` `st` on(`s`.`state_id` = `st`.`id`)) join `property_types` `pt` on(`p`.`property_type_id` = `pt`.`id`)) join `property_statuses` `ps` on(`p`.`status_id` = `ps`.`id`)) join `users` `u` on(`p`.`seller_id` = `u`.`id`)) WHERE `ps`.`name` in ('active','new','premium') ;

-- --------------------------------------------------------

--
-- Structure for view `vw_property_search`
--
DROP TABLE IF EXISTS `vw_property_search`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_property_search`  AS SELECT `p`.`id` AS `id`, `p`.`headline` AS `headline`, `p`.`street_address` AS `street_address`, `s`.`name` AS `suburb`, `st`.`code` AS `state`, `s`.`postcode` AS `postcode`, `pt`.`name` AS `property_type`, `p`.`bedrooms` AS `bedrooms`, `p`.`bathrooms` AS `bathrooms`, `p`.`car_spaces` AS `car_spaces`, `p`.`price` AS `price`, `p`.`ai_valuation_mid` AS `ai_valuation_mid`, `pi`.`url` AS `primary_image`, `p`.`listed_at` AS `listed_at` FROM (((((`properties` `p` join `suburbs` `s` on(`p`.`suburb_id` = `s`.`id`)) join `states` `st` on(`s`.`state_id` = `st`.`id`)) join `property_types` `pt` on(`p`.`property_type_id` = `pt`.`id`)) join `property_statuses` `ps` on(`p`.`status_id` = `ps`.`id`)) left join `property_images` `pi` on(`p`.`id` = `pi`.`property_id` and `pi`.`is_primary` = 1)) WHERE `ps`.`name` in ('active','new','premium') ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_property_insights`
--
ALTER TABLE `ai_property_insights`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property` (`property_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `billing_plans`
--
ALTER TABLE `billing_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `billing_transactions`
--
ALTER TABLE `billing_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `billing_plan_id` (`billing_plan_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property` (`property_id`);

--
-- Indexes for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_participant` (`conversation_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_property` (`property_id`),
  ADD KEY `idx_type` (`document_type_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `document_shares`
--
ALTER TABLE `document_shares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_share` (`document_id`,`shared_with_user_id`),
  ADD KEY `shared_with_user_id` (`shared_with_user_id`),
  ADD KEY `shared_by_user_id` (`shared_by_user_id`);

--
-- Indexes for table `document_types`
--
ALTER TABLE `document_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property` (`property_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `features`
--
ALTER TABLE `features`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `inspections`
--
ALTER TABLE `inspections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property` (`property_id`),
  ADD KEY `idx_date` (`scheduled_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_inspections_date_status` (`scheduled_date`,`status`);

--
-- Indexes for table `inspection_attendees`
--
ALTER TABLE `inspection_attendees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_booking` (`inspection_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `lead_contact`
--
ALTER TABLE `lead_contact`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversation` (`conversation_id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_sent` (`sent_at`);

--
-- Indexes for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_id` (`message_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`user_id`,`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `parent_offer_id` (`parent_offer_id`),
  ADD KEY `idx_property` (`property_id`),
  ADD KEY `idx_buyer` (`buyer_id`),
  ADD KEY `idx_status` (`status_id`),
  ADD KEY `idx_offers_property_status` (`property_id`,`status_id`);

--
-- Indexes for table `offer_conditions`
--
ALTER TABLE `offer_conditions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_offer` (`offer_id`);

--
-- Indexes for table `offer_statuses`
--
ALTER TABLE `offer_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_type_id` (`property_type_id`),
  ADD KEY `billing_plan_id` (`billing_plan_id`),
  ADD KEY `idx_seller` (`seller_id`),
  ADD KEY `idx_suburb` (`suburb_id`),
  ADD KEY `idx_status` (`status_id`),
  ADD KEY `idx_price` (`price`),
  ADD KEY `idx_bedrooms` (`bedrooms`),
  ADD KEY `idx_listed` (`listed_at`),
  ADD KEY `idx_properties_search` (`status_id`,`suburb_id`,`property_type_id`,`price`),
  ADD KEY `idx_properties_seller_status` (`seller_id`,`status_id`);
ALTER TABLE `properties` ADD FULLTEXT KEY `idx_search` (`headline`,`title`,`description`);

--
-- Indexes for table `property_features`
--
ALTER TABLE `property_features`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_property_feature` (`property_id`,`feature_id`),
  ADD KEY `feature_id` (`feature_id`);

--
-- Indexes for table `property_images`
--
ALTER TABLE `property_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property` (`property_id`),
  ADD KEY `idx_primary` (`property_id`,`is_primary`);

--
-- Indexes for table `property_statuses`
--
ALTER TABLE `property_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `property_types`
--
ALTER TABLE `property_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `saved_properties`
--
ALTER TABLE `saved_properties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_saved` (`user_id`,`property_id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `schools_nearby`
--
ALTER TABLE `schools_nearby`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_property` (`property_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id` (`session_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_session` (`session_id`);

--
-- Indexes for table `similar_properties`
--
ALTER TABLE `similar_properties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `similar_property_id` (`similar_property_id`),
  ADD KEY `idx_property` (`property_id`);

--
-- Indexes for table `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `suburbs`
--
ALTER TABLE `suburbs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_suburb` (`name`,`postcode`,`state_id`),
  ADD KEY `state_id` (`state_id`),
  ADD KEY `idx_postcode` (`postcode`);

--
-- Indexes for table `suburb_insights`
--
ALTER TABLE `suburb_insights`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suburb` (`suburb_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_username` (`username`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_token` (`token_hash`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_property_insights`
--
ALTER TABLE `ai_property_insights`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `billing_plans`
--
ALTER TABLE `billing_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `billing_transactions`
--
ALTER TABLE `billing_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `document_shares`
--
ALTER TABLE `document_shares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_types`
--
ALTER TABLE `document_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `enquiries`
--
ALTER TABLE `enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `features`
--
ALTER TABLE `features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `inspections`
--
ALTER TABLE `inspections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `inspection_attendees`
--
ALTER TABLE `inspection_attendees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_contact`
--
ALTER TABLE `lead_contact`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_attachments`
--
ALTER TABLE `message_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `offer_conditions`
--
ALTER TABLE `offer_conditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `offer_statuses`
--
ALTER TABLE `offer_statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `property_features`
--
ALTER TABLE `property_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `property_images`
--
ALTER TABLE `property_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `property_statuses`
--
ALTER TABLE `property_statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `property_types`
--
ALTER TABLE `property_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `saved_properties`
--
ALTER TABLE `saved_properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `schools_nearby`
--
ALTER TABLE `schools_nearby`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT for table `similar_properties`
--
ALTER TABLE `similar_properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `states`
--
ALTER TABLE `states`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `suburbs`
--
ALTER TABLE `suburbs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `suburb_insights`
--
ALTER TABLE `suburb_insights`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_property_insights`
--
ALTER TABLE `ai_property_insights`
  ADD CONSTRAINT `ai_property_insights_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `billing_transactions`
--
ALTER TABLE `billing_transactions`
  ADD CONSTRAINT `billing_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `billing_transactions_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`),
  ADD CONSTRAINT `billing_transactions_ibfk_3` FOREIGN KEY (`billing_plan_id`) REFERENCES `billing_plans` (`id`);

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`);

--
-- Constraints for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD CONSTRAINT `conversation_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversation_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`document_type_id`) REFERENCES `document_types` (`id`),
  ADD CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `documents_ibfk_4` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `document_shares`
--
ALTER TABLE `document_shares`
  ADD CONSTRAINT `document_shares_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_shares_ibfk_2` FOREIGN KEY (`shared_with_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `document_shares_ibfk_3` FOREIGN KEY (`shared_by_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD CONSTRAINT `enquiries_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enquiries_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inspections`
--
ALTER TABLE `inspections`
  ADD CONSTRAINT `inspections_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inspection_attendees`
--
ALTER TABLE `inspection_attendees`
  ADD CONSTRAINT `inspection_attendees_ibfk_1` FOREIGN KEY (`inspection_id`) REFERENCES `inspections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inspection_attendees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD CONSTRAINT `message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `offers`
--
ALTER TABLE `offers`
  ADD CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `offers_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `offers_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `offers_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `offer_statuses` (`id`),
  ADD CONSTRAINT `offers_ibfk_5` FOREIGN KEY (`parent_offer_id`) REFERENCES `offers` (`id`);

--
-- Constraints for table `offer_conditions`
--
ALTER TABLE `offer_conditions`
  ADD CONSTRAINT `offer_conditions_ibfk_1` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `properties`
--
ALTER TABLE `properties`
  ADD CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `properties_ibfk_2` FOREIGN KEY (`suburb_id`) REFERENCES `suburbs` (`id`),
  ADD CONSTRAINT `properties_ibfk_3` FOREIGN KEY (`property_type_id`) REFERENCES `property_types` (`id`),
  ADD CONSTRAINT `properties_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `property_statuses` (`id`),
  ADD CONSTRAINT `properties_ibfk_5` FOREIGN KEY (`billing_plan_id`) REFERENCES `billing_plans` (`id`);

--
-- Constraints for table `property_features`
--
ALTER TABLE `property_features`
  ADD CONSTRAINT `property_features_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `property_features_ibfk_2` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`);

--
-- Constraints for table `property_images`
--
ALTER TABLE `property_images`
  ADD CONSTRAINT `property_images_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_properties`
--
ALTER TABLE `saved_properties`
  ADD CONSTRAINT `saved_properties_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_properties_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `schools_nearby`
--
ALTER TABLE `schools_nearby`
  ADD CONSTRAINT `schools_nearby_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `similar_properties`
--
ALTER TABLE `similar_properties`
  ADD CONSTRAINT `similar_properties_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `similar_properties_ibfk_2` FOREIGN KEY (`similar_property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `suburbs`
--
ALTER TABLE `suburbs`
  ADD CONSTRAINT `suburbs_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`);

--
-- Constraints for table `suburb_insights`
--
ALTER TABLE `suburb_insights`
  ADD CONSTRAINT `suburb_insights_ibfk_1` FOREIGN KEY (`suburb_id`) REFERENCES `suburbs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`root`@`localhost` EVENT `evt_cleanup_verifications` ON SCHEDULE EVERY 1 HOUR STARTS '2026-02-03 07:32:15' ON COMPLETION NOT PRESERVE ENABLE DO CALL sp_cleanup_expired_verifications()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
