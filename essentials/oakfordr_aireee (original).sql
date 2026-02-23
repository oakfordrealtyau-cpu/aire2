-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 30, 2026 at 01:07 PM
-- Server version: 8.0.44-35
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `oakfordr_aireee`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_property_insights`
--

CREATE TABLE `ai_property_insights` (
  `insight_id` bigint NOT NULL,
  `property_id` bigint NOT NULL,
  `estimated_min` decimal(12,2) DEFAULT NULL,
  `estimated_max` decimal(12,2) DEFAULT NULL,
  `demand_score` decimal(4,1) DEFAULT NULL,
  `predicted_days_on_market` int DEFAULT NULL,
  `similarity_match` int DEFAULT NULL,
  `live_traffic` int DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_property_insights`
--

INSERT INTO `ai_property_insights` (`insight_id`, `property_id`, `estimated_min`, `estimated_max`, `demand_score`, `predicted_days_on_market`, `similarity_match`, `live_traffic`, `updated_at`) VALUES
(1, 1, 815000.00, 830000.00, 8.7, 14, 92, 3, '2025-12-06 03:22:07');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int NOT NULL,
  `contct_nme` varchar(100) NOT NULL,
  `contct_eml` varchar(100) NOT NULL,
  `contct_subject` varchar(150) NOT NULL,
  `contct_enquiry` text NOT NULL,
  `contct_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `contct_nme`, `contct_eml`, `contct_subject`, `contct_enquiry`, `contct_date`) VALUES
(1, 'ice', 'iceki1801@gmail.com', 'test', 'test message from contact page', '2025-12-09'),
(2, 'ice', 'iceki1801@gmail.com', 'test', 'soime rthfghjhfg gdgjd', '2025-12-09');

-- --------------------------------------------------------

--
-- Table structure for table `enquiries`
--

CREATE TABLE `enquiries` (
  `enquiry_id` bigint NOT NULL,
  `property_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `source` enum('request_info','ask_aiva','contact_agent') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_contact`
--

CREATE TABLE `lead_contact` (
  `id` int NOT NULL,
  `contct_nme` varchar(255) NOT NULL,
  `contct_eml` varchar(255) NOT NULL,
  `contct_enquiry` text NOT NULL,
  `contct_date` date NOT NULL,
  `contct_num` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `offers`
--

CREATE TABLE `offers` (
  `offer_id` bigint NOT NULL,
  `property_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `offer_amount` decimal(12,2) DEFAULT NULL,
  `status` enum('pending','accepted','rejected','withdrawn') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `open_homes`
--

CREATE TABLE `open_homes` (
  `openhome_id` bigint NOT NULL,
  `property_id` bigint DEFAULT NULL,
  `start_datetime` datetime DEFAULT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `open_homes`
--

INSERT INTO `open_homes` (`openhome_id`, `property_id`, `start_datetime`, `end_datetime`, `created_at`) VALUES
(1, 1, '2025-12-07 12:30:00', '2025-12-07 13:00:00', '2025-12-06 03:22:07'),
(2, 1, '2025-12-08 10:00:00', '2025-12-08 10:30:00', '2025-12-06 03:22:07');

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `property_id` bigint NOT NULL,
  `vendor_id` bigint DEFAULT NULL,
  `agent_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `slug` varchar(190) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `ai_summary` text COLLATE utf8mb4_general_ci,
  `price_display` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price_min` decimal(12,2) DEFAULT NULL,
  `price_max` decimal(12,2) DEFAULT NULL,
  `price_type` enum('range','offers_above','eoi','fixed') COLLATE utf8mb4_general_ci DEFAULT 'range',
  `address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `suburb` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `postcode` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `suburb_id` bigint DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `land_size` int DEFAULT NULL,
  `building_size` int DEFAULT NULL,
  `bedrooms` int DEFAULT NULL,
  `bathrooms` int DEFAULT NULL,
  `car_bays` int DEFAULT NULL,
  `building_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `energy_rating` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('new','active','under_offer','sold','draft','premium') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `commute_time` int DEFAULT NULL,
  `home_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `backyard` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_sponsored` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `properties`
--

INSERT INTO `properties` (`property_id`, `vendor_id`, `agent_id`, `title`, `slug`, `description`, `ai_summary`, `price_display`, `price_min`, `price_max`, `price_type`, `address`, `suburb`, `state`, `postcode`, `suburb_id`, `latitude`, `longitude`, `land_size`, `building_size`, `bedrooms`, `bathrooms`, `car_bays`, `building_type`, `energy_rating`, `status`, `created_at`, `updated_at`, `commute_time`, `home_type`, `backyard`, `is_sponsored`) VALUES
(1, 1, 1, 'Relaxed Hills Living with Views, Space & Privacy', '46-ellis-road-mount-nasura', 'A charming family home on a quiet cul-de-sac, recently updated kitchen, large backyard ideal for families and entertaining.', 'AIVA generated summary', '$799,000 – $850,000', 799000.00, 850000.00, 'range', '46 Ellis Road, Mount Nasura WA 6112', 'Mount Nasura', 'WA', '6112', 2, -31.9535000, 115.8570000, 1012, NULL, 3, 1, 2, 'Brick Home', 'Energy Efficient', 'active', '2025-12-06 03:22:07', '2026-01-07 05:02:42', 5, 'Brick Home', 'Large Backyard', NULL),
(2, 2, 4, 'Modern Family Home', '123-main-st-hobart', 'Spacious home in Hobart', 'AIVA summary', '$720,000', 720000.00, 720000.00, 'fixed', '123 Main St', 'Hobart', 'TAS', '7000', 3, NULL, NULL, 3, NULL, 2, 2, 2, 'Brick', 'Solar Ready', 'active', '2025-12-06 03:22:07', '2026-01-05 02:38:33', 7, 'Modern Home', 'Medium Backyard', NULL),
(3, 3, 4, 'Luxury Perth Residence', '456-swan-rd-perth', 'Luxurious residence in Perth', 'AIVA summary', '$2,350,000', 2350000.00, 2350000.00, 'fixed', '456 Swan Rd', 'Perth', 'WA', '6000', 6, NULL, NULL, 6, NULL, 5, 3, 3, 'Brick', 'Solar Ready', 'active', '2025-12-06 03:22:07', '2026-01-05 02:39:03', 2, 'Luxury Residence', 'Spacious Backyard', NULL),
(4, 2, 1, 'Cozy Adelaide Cottage', '789-adelaide-st', 'Charming cottage in Adelaide', 'AIVA summary', '$560,000', 560000.00, 560000.00, 'fixed', '789 Adelaide St', 'Adelaide', 'SA', '5000', 5, NULL, NULL, 2, NULL, 1, 1, 1, 'Brick', 'Energy Efficient', 'active', '2025-12-06 03:22:07', '2026-01-05 02:39:10', 5, 'Cottage', 'Cozy Backyard', NULL),
(5, 3, 4, 'Newstead Family Home', '12-newstead-ave', 'Spacious family home in Newstead', 'AIVA summary', '$1,480,000', 1480000.00, 1480000.00, 'fixed', '12 Newstead Ave', 'Newstead', 'QLD', '4000', 4, NULL, NULL, 5, NULL, 3, 2, 2, 'Brick', 'Solar Ready', 'active', '2025-12-06 03:22:07', '2026-01-05 02:38:41', 5, 'Family Home', 'Huge Backyard', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `property_documents`
--

CREATE TABLE `property_documents` (
  `document_id` bigint NOT NULL,
  `property_id` bigint DEFAULT NULL,
  `doc_type` enum('floorplan','brochure','contract','building_report') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_documents`
--

INSERT INTO `property_documents` (`document_id`, `property_id`, `doc_type`, `file_url`, `created_at`) VALUES
(1, 1, 'floorplan', 'https://via.placeholder.com/1000x600', '2025-12-06 03:22:07'),
(2, 1, 'brochure', '#', '2025-12-06 03:22:07'),
(3, 1, 'contract', '#', '2025-12-06 03:22:07');

-- --------------------------------------------------------

--
-- Table structure for table `property_photos`
--

CREATE TABLE `property_photos` (
  `photo_id` bigint NOT NULL,
  `property_id` bigint DEFAULT NULL,
  `photo_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_photos`
--

INSERT INTO `property_photos` (`photo_id`, `property_id`, `photo_url`, `sort_order`, `is_featured`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600', 1, 1),
(2, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600', 2, 0),
(3, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600', 3, 0),
(4, 2, 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200', 1, 1),
(5, 3, 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200', 1, 1),
(6, 4, 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200', 1, 1),
(7, 5, 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `property_saves`
--

CREATE TABLE `property_saves` (
  `save_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `property_id` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_saves`
--

INSERT INTO `property_saves` (`save_id`, `user_id`, `property_id`, `created_at`) VALUES
(1, 2, 1, '2025-12-06 03:22:07'),
(2, 3, 1, '2025-12-06 03:22:07');

-- --------------------------------------------------------

--
-- Table structure for table `schools_nearby`
--

CREATE TABLE `schools_nearby` (
  `school_id` bigint NOT NULL,
  `property_id` bigint DEFAULT NULL,
  `school_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `distance_km` decimal(5,2) DEFAULT NULL,
  `drive_minutes` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schools_nearby`
--

INSERT INTO `schools_nearby` (`school_id`, `property_id`, `school_name`, `distance_km`, `drive_minutes`) VALUES
(1, 1, 'Mount Nasura Primary School', 1.20, 5),
(2, 1, 'Hills High School', 3.40, 8);

-- --------------------------------------------------------

--
-- Table structure for table `similar_properties`
--

CREATE TABLE `similar_properties` (
  `id` bigint NOT NULL,
  `property_id` bigint DEFAULT NULL,
  `similar_property_id` bigint DEFAULT NULL,
  `score` int DEFAULT NULL
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
-- Table structure for table `suburb_insights`
--

CREATE TABLE `suburb_insights` (
  `suburb_id` bigint NOT NULL COMMENT 'Primary key',
  `suburb` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Suburb name',
  `postcode` varchar(10) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Postcode',
  `state` varchar(10) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'State (e.g. WA, NSW)',
  `slug` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'URL slug: suburb-name-postcode',
  `median_price` decimal(12,2) DEFAULT NULL COMMENT 'Median sale price',
  `median_rent` decimal(12,2) DEFAULT NULL COMMENT 'Median weekly rent',
  `rental_yield` decimal(5,2) DEFAULT NULL COMMENT 'Rental yield %',
  `trend_30day` decimal(5,2) DEFAULT NULL COMMENT '30-day price movement %',
  `trend_90day` decimal(5,2) DEFAULT NULL COMMENT '90-day price movement %',
  `days_on_market` int DEFAULT NULL COMMENT 'Avg days on market',
  `demand_index` decimal(4,2) DEFAULT NULL COMMENT 'AI demand score 1–10',
  `predicted_activity` enum('Lower','Stable','Increased') COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'AI market prediction',
  `buyer_heatmap` text COLLATE utf8mb4_general_ci COMMENT 'JSON heat map',
  `school_zones` text COLLATE utf8mb4_general_ci COMMENT 'JSON school zone data',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ai_summary` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suburb_insights`
--

INSERT INTO `suburb_insights` (`suburb_id`, `suburb`, `postcode`, `state`, `slug`, `median_price`, `median_rent`, `rental_yield`, `trend_30day`, `trend_90day`, `days_on_market`, `demand_index`, `predicted_activity`, `buyer_heatmap`, `school_zones`, `updated_at`, `ai_summary`) VALUES
(1, 'Baldivis', '6171', 'WA', 'baldivis-6171', 612000.00, 580.00, 4.93, 2.40, 4.80, 46, 8.70, 'Increased', '{ \"hotspots\": [ {\"lat\": -32.33, \"lng\": 115.82, \"intensity\": 0.9} ] }', '[ {\"school\": \"Baldivis Primary School\", \"rating\": 8} ]', '2025-12-08 07:36:52', 'Baldivis, WA 6171 is experiencing a strong market with a median house price of $612,000. Prices have increased 2.4% over the last month, with high buyer interest (AI demand: 8.7/10). Properties sell in an average of 46 days. Rental yields are 4.93%, and schools nearby are highly rated. Overall, market activity is increasing.'),
(2, 'Mount Nasura', '6112', 'WA', 'mount-nasura-6112', 645000.00, 520.00, 4.19, 2.80, 5.10, 41, 8.20, 'Increased', '{ \"hotspots\": [ {\"lat\": -32.13, \"lng\": 116.01, \"intensity\": 0.85} ] }', '[ {\"school\": \"Armadale Primary School\", \"rating\": 7} ]', '2025-12-08 07:36:52', 'Mount Nasura, WA 6112 shows a growing market with a median house price of $645,000 and a 2.8% price increase over the past month. The AI demand rating is 8.2/10, and average days on market is 41. Rental yields stand at 4.19%, making it attractive for investors. Local schools have good ratings, and market activity is trending upward.'),
(3, 'Hobart', '7000', 'TAS', 'hobart-7000', 820000.00, 620.00, 3.93, 1.50, 2.10, 55, 7.30, 'Stable', '{ \"hotspots\": [ {\"lat\": -42.88, \"lng\": 147.32, \"intensity\": 0.78} ] }', '[ {\"school\": \"Hobart City High\", \"rating\": 9} ]', '2025-12-08 07:36:52', 'Hobart, TAS 7000 is a stable market with a median house price of $820,000. Prices have increased 1.5% over the last month, with moderate demand (AI rating 7.3/10). Homes take an average of 55 days to sell. Rental yields are 3.93%, and schools in the area are well-regarded. Market activity is expected to remain stable.'),
(4, 'Newstead', '4006', 'QLD', 'newstead-4006', 1450000.00, 760.00, 2.72, 2.20, 3.10, 38, 9.10, 'Increased', '{ \"hotspots\": [ {\"lat\": -27.45, \"lng\": 153.04, \"intensity\": 0.92} ] }', '[ {\"school\": \"New Farm State School\", \"rating\": 9} ]', '2025-12-08 07:36:52', 'Newstead, QLD 4006 has a strong and growing property market with a median price of $1,450,000. Prices rose 2.2% over the last 30 days, and AI demand is 9.1/10. Average days on market is 38, and rental yields are 2.72%. High-rated schools attract families, and market activity is increasing.'),
(5, 'Adelaide', '5000', 'SA', 'adelaide-5000', 690000.00, 580.00, 4.37, 0.50, 1.40, 59, 6.90, 'Stable', '{ \"hotspots\": [ {\"lat\": -34.93, \"lng\": 138.60, \"intensity\": 0.75} ] }', '[ {\"school\": \"Adelaide High School\", \"rating\": 10} ]', '2025-12-08 07:36:52', 'Adelaide, SA 5000 maintains a stable market with a median price of $690,000 and a 0.5% increase last month. AI demand rating is 6.9/10. Average days on market is 59, and rental yields are 4.37%. Local schools are highly rated, and market activity is predicted to remain stable in the coming months.'),
(6, 'Perth', '6000', 'WA', 'perth-6000', 750000.00, 620.00, 4.29, 3.00, 5.30, 44, 8.90, 'Increased', '{ \"hotspots\": [ {\"lat\": -31.95, \"lng\": 115.86, \"intensity\": 0.95} ] }', '[ {\"school\": \"Perth Modern School\", \"rating\": 10} ]', '2025-12-08 07:36:52', 'Perth, WA 6000 continues to see increased activity with a median house price of $750,000. Prices increased 3% over the last month, with AI demand rating of 8.9/10. Average days on market is 44, and rental yields are 4.29%. Excellent school zones enhance its appeal, and market activity is expected to keep rising.'),
(7, 'Alexander Heights', '6064', 'WA', 'alexander-heights-6064', 585000.00, 550.00, 4.89, 1.90, 3.60, 39, 8.30, 'Increased', '{hotspots: [{ \"lat\": -31.83, \"lng\": 115.86, \"intensity\": 0.85 }]}', '[{\"school\":\"Alexander Heights Primary School\",\"rating\":7},{\"school\":\"Ashdale Secondary College\",\"rating\":8}]', '2026-01-05 07:36:52', 'Alexander Heights, WA 6064 shows a resilient suburban market with a median house price of $585,000. Values have risen by 1.9% in the past 30 days and 3.6% over 90 days, supported by solid buyer demand (AI demand index: 8.3/10). Homes spend an average of 39 days on the market, indicating healthy turnover. Rental yields remain attractive at 4.89%, and access to well-rated schools strengthens long-term livability. Overall, the area demonstrates stable growth with increasing buyer confidence.');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `user_type` enum('buyer','seller','agent','admin') COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `password_hash`, `user_type`, `phone`, `created_at`, `updated_at`) VALUES
(1, 'Jane', 'Seller', 'jane.seller@example.com', 'hashed_password1', 'agent', '0412000111', '2025-12-06 03:22:07', '2025-12-06 03:22:07'),
(2, 'John', 'Buyer', 'john.buyer@example.com', 'hashed_password2', 'buyer', '0412000222', '2025-12-06 03:22:07', '2025-12-06 03:22:07'),
(3, 'Alice', 'Buyer', 'alice.buyer@example.com', 'hashed_password3', 'buyer', '0412000333', '2025-12-06 03:22:07', '2025-12-06 03:22:07'),
(4, 'Bob', 'Agent', 'bob.agent@example.com', 'hashed_password4', 'agent', '0412000444', '2025-12-06 03:22:07', '2025-12-06 03:22:07'),
(5, 'Admin', 'User', 'admin@example.com', 'hashed_password5', 'admin', '0412000555', '2025-12-06 03:22:07', '2025-12-06 03:22:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_property_insights`
--
ALTER TABLE `ai_property_insights`
  ADD PRIMARY KEY (`insight_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD PRIMARY KEY (`enquiry_id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `lead_contact`
--
ALTER TABLE `lead_contact`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `offers`
--
ALTER TABLE `offers`
  ADD PRIMARY KEY (`offer_id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `open_homes`
--
ALTER TABLE `open_homes`
  ADD PRIMARY KEY (`openhome_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`property_id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_agent` (`agent_id`),
  ADD KEY `idx_suburb` (`suburb`(191)),
  ADD KEY `idx_state` (`state`);

--
-- Indexes for table `property_documents`
--
ALTER TABLE `property_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `property_photos`
--
ALTER TABLE `property_photos`
  ADD PRIMARY KEY (`photo_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `property_saves`
--
ALTER TABLE `property_saves`
  ADD PRIMARY KEY (`save_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `schools_nearby`
--
ALTER TABLE `schools_nearby`
  ADD PRIMARY KEY (`school_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `similar_properties`
--
ALTER TABLE `similar_properties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `similar_property_id` (`similar_property_id`);

--
-- Indexes for table `suburb_insights`
--
ALTER TABLE `suburb_insights`
  ADD PRIMARY KEY (`suburb_id`),
  ADD KEY `idx_slug` (`slug`(191));

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_property_insights`
--
ALTER TABLE `ai_property_insights`
  MODIFY `insight_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `enquiries`
--
ALTER TABLE `enquiries`
  MODIFY `enquiry_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_contact`
--
ALTER TABLE `lead_contact`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `offers`
--
ALTER TABLE `offers`
  MODIFY `offer_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `open_homes`
--
ALTER TABLE `open_homes`
  MODIFY `openhome_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `property_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `property_documents`
--
ALTER TABLE `property_documents`
  MODIFY `document_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `property_photos`
--
ALTER TABLE `property_photos`
  MODIFY `photo_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `property_saves`
--
ALTER TABLE `property_saves`
  MODIFY `save_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `schools_nearby`
--
ALTER TABLE `schools_nearby`
  MODIFY `school_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `similar_properties`
--
ALTER TABLE `similar_properties`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `suburb_insights`
--
ALTER TABLE `suburb_insights`
  MODIFY `suburb_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key', AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_property_insights`
--
ALTER TABLE `ai_property_insights`
  ADD CONSTRAINT `ai_property_insights_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD CONSTRAINT `enquiries_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enquiries_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `offers`
--
ALTER TABLE `offers`
  ADD CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `offers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `open_homes`
--
ALTER TABLE `open_homes`
  ADD CONSTRAINT `open_homes_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `properties`
--
ALTER TABLE `properties`
  ADD CONSTRAINT `fk_properties_agent` FOREIGN KEY (`agent_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `property_documents`
--
ALTER TABLE `property_documents`
  ADD CONSTRAINT `property_documents_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `property_photos`
--
ALTER TABLE `property_photos`
  ADD CONSTRAINT `property_photos_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `property_saves`
--
ALTER TABLE `property_saves`
  ADD CONSTRAINT `property_saves_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `property_saves_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `schools_nearby`
--
ALTER TABLE `schools_nearby`
  ADD CONSTRAINT `schools_nearby_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE;

--
-- Constraints for table `similar_properties`
--
ALTER TABLE `similar_properties`
  ADD CONSTRAINT `similar_properties_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `similar_properties_ibfk_2` FOREIGN KEY (`similar_property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
