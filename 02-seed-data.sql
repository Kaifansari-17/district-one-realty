-- MySQL dump 10.13  Distrib 9.3.0, for Win64 (x86_64)
--
-- Host: localhost    Database: district_one_realty_seedgen
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Prisma's own internal migration-tracking table — not part of the app schema, but created
-- automatically by the `prisma migrate deploy` CLI. Since we're applying the schema manually
-- instead of via that CLI, it needs to be created here too.
--

CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT IGNORE INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('b7bc8cb9-f434-441e-9135-d39105be1d29','ea0880972df46154f04375949113e7b436a38638304b637883c993b7e86c8f65','2026-09-11 19:22:39.622','20260909191745_init',NULL,NULL,'2026-09-11 19:22:35.888',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ActivityLog`
--

LOCK TABLES `ActivityLog` WRITE;
/*!40000 ALTER TABLE `ActivityLog` DISABLE KEYS */;
/*!40000 ALTER TABLE `ActivityLog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Amenity`
--

LOCK TABLES `Amenity` WRITE;
/*!40000 ALTER TABLE `Amenity` DISABLE KEYS */;
INSERT INTO `Amenity` (`id`, `name`, `slug`, `icon`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmtxcfr77000jro5w6nv4hjt8','Swimming Pool','swimming-pool',NULL,NULL,1,'2026-09-11 19:22:52.148','2026-09-11 19:22:52.148'),('cmtxcfr7c000kro5wxvistkyp','Gym','gym',NULL,NULL,1,'2026-09-11 19:22:52.153','2026-09-11 19:22:52.153'),('cmtxcfr7f000lro5w3307rh0z','Club House','club-house',NULL,NULL,1,'2026-09-11 19:22:52.156','2026-09-11 19:22:52.156'),('cmtxcfr7l000mro5waweuvilg','Garden','garden',NULL,NULL,1,'2026-09-11 19:22:52.161','2026-09-11 19:22:52.161'),('cmtxcfr7p000nro5wxv9m8x2z','Lift','lift',NULL,NULL,1,'2026-09-11 19:22:52.165','2026-09-11 19:22:52.165'),('cmtxcfr7t000oro5wmt32wefl','CCTV','cctv',NULL,NULL,1,'2026-09-11 19:22:52.169','2026-09-11 19:22:52.169'),('cmtxcfr7x000pro5wy1dt6544','Security','security',NULL,NULL,1,'2026-09-11 19:22:52.174','2026-09-11 19:22:52.174'),('cmtxcfr81000qro5wohatti0q','Parking','parking',NULL,NULL,1,'2026-09-11 19:22:52.178','2026-09-11 19:22:52.178'),('cmtxcfr85000rro5wprdj7sjh','Kids Play Area','kids-play-area',NULL,NULL,1,'2026-09-11 19:22:52.181','2026-09-11 19:22:52.181'),('cmtxcfr87000sro5wpht8n88n','Jogging Track','jogging-track',NULL,NULL,1,'2026-09-11 19:22:52.184','2026-09-11 19:22:52.184');
/*!40000 ALTER TABLE `Amenity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Blog`
--

LOCK TABLES `Blog` WRITE;
/*!40000 ALTER TABLE `Blog` DISABLE KEYS */;
/*!40000 ALTER TABLE `Blog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Builder`
--

LOCK TABLES `Builder` WRITE;
/*!40000 ALTER TABLE `Builder` DISABLE KEYS */;
/*!40000 ALTER TABLE `Builder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `City`
--

LOCK TABLES `City` WRITE;
/*!40000 ALTER TABLE `City` DISABLE KEYS */;
INSERT INTO `City` (`id`, `name`, `slug`, `stateId`, `createdAt`, `updatedAt`) VALUES ('cmtxcfr6d0004ro5wqgh2y162','Navi Mumbai','navi-mumbai','cmtxcfr680002ro5wn9bb29d0','2026-09-11 19:22:52.118','2026-09-11 19:22:52.118');
/*!40000 ALTER TABLE `City` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ContactMessage`
--

LOCK TABLES `ContactMessage` WRITE;
/*!40000 ALTER TABLE `ContactMessage` DISABLE KEYS */;
/*!40000 ALTER TABLE `ContactMessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Country`
--

LOCK TABLES `Country` WRITE;
/*!40000 ALTER TABLE `Country` DISABLE KEYS */;
INSERT INTO `Country` (`id`, `name`, `slug`, `createdAt`, `updatedAt`) VALUES ('cmtxcfr5x0000ro5whg9whfq2','India','india','2026-09-11 19:22:52.102','2026-09-11 19:22:52.102');
/*!40000 ALTER TABLE `Country` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Feature`
--

LOCK TABLES `Feature` WRITE;
/*!40000 ALTER TABLE `Feature` DISABLE KEYS */;
INSERT INTO `Feature` (`id`, `name`, `slug`, `icon`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmtxcfr8b000tro5wa8low32r','Modular Kitchen','modular-kitchen',NULL,1,'2026-09-11 19:22:52.187','2026-09-11 19:22:52.187'),('cmtxcfr8g000uro5web74aoh9','Vaastu Compliant','vaastu-compliant',NULL,1,'2026-09-11 19:22:52.192','2026-09-11 19:22:52.192'),('cmtxcfr8j000vro5w6hrq30p4','Corner Unit','corner-unit',NULL,1,'2026-09-11 19:22:52.195','2026-09-11 19:22:52.195'),('cmtxcfr8m000wro5wm0l7914q','Park Facing','park-facing',NULL,1,'2026-09-11 19:22:52.198','2026-09-11 19:22:52.198'),('cmtxcfr8p000xro5wjpyb6u62','Sea View','sea-view',NULL,1,'2026-09-11 19:22:52.201','2026-09-11 19:22:52.201');
/*!40000 ALTER TABLE `Feature` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Lead`
--

LOCK TABLES `Lead` WRITE;
/*!40000 ALTER TABLE `Lead` DISABLE KEYS */;
/*!40000 ALTER TABLE `Lead` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `LeadNote`
--

LOCK TABLES `LeadNote` WRITE;
/*!40000 ALTER TABLE `LeadNote` DISABLE KEYS */;
/*!40000 ALTER TABLE `LeadNote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Location`
--

LOCK TABLES `Location` WRITE;
/*!40000 ALTER TABLE `Location` DISABLE KEYS */;
INSERT INTO `Location` (`id`, `name`, `slug`, `cityId`, `description`, `pincode`, `latitude`, `longitude`, `metaTitle`, `metaDescription`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmtxcfr6i0006ro5w9k8flccx','Nerul','nerul','cmtxcfr6d0004ro5wqgh2y162','An established, premium residential hub known for its planned sectors and seafront proximity.',NULL,NULL,NULL,NULL,NULL,1,'2026-09-11 19:22:52.122','2026-09-11 19:22:52.122'),('cmtxcfr6n0008ro5wqobv8vea','Seawoods','seawoods','cmtxcfr6d0004ro5wqgh2y162','A premium residential destination anchored by upscale retail and rail connectivity.',NULL,NULL,NULL,NULL,NULL,1,'2026-09-11 19:22:52.128','2026-09-11 19:22:52.128'),('cmtxcfr6q000aro5w3asib94j','Kharghar','kharghar','cmtxcfr6d0004ro5wqgh2y162','A fast-growing residential locality known for its green, planned layout.',NULL,NULL,NULL,NULL,NULL,1,'2026-09-11 19:22:52.131','2026-09-11 19:22:52.131'),('cmtxcfr6u000cro5wp6bx6cx1','Vashi','vashi','cmtxcfr6d0004ro5wqgh2y162','An established commercial and residential hub with strong connectivity to Mumbai.',NULL,NULL,NULL,NULL,NULL,1,'2026-09-11 19:22:52.134','2026-09-11 19:22:52.134'),('cmtxcfr6w000ero5w4l9cfqyt','Belapur','belapur','cmtxcfr6d0004ro5wqgh2y162','The administrative heart of Navi Mumbai, offering established residential neighborhoods.',NULL,NULL,NULL,NULL,NULL,1,'2026-09-11 19:22:52.137','2026-09-11 19:22:52.137'),('cmtxcfr6z000gro5w59pi7w74','Panvel','panvel','cmtxcfr6d0004ro5wqgh2y162','A rapidly expanding locality benefiting from major infrastructure and connectivity projects.',NULL,NULL,NULL,NULL,NULL,1,'2026-09-11 19:22:52.140','2026-09-11 19:22:52.140'),('cmtxcfr73000iro5wgi5kij3y','Ulwe','ulwe','cmtxcfr6d0004ro5wqgh2y162','An emerging locality driven by the upcoming Navi Mumbai International Airport.',NULL,NULL,NULL,NULL,NULL,1,'2026-09-11 19:22:52.143','2026-09-11 19:22:52.143');
/*!40000 ALTER TABLE `Location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Media`
--

LOCK TABLES `Media` WRITE;
/*!40000 ALTER TABLE `Media` DISABLE KEYS */;
/*!40000 ALTER TABLE `Media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Notification`
--

LOCK TABLES `Notification` WRITE;
/*!40000 ALTER TABLE `Notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `PasswordResetToken`
--

LOCK TABLES `PasswordResetToken` WRITE;
/*!40000 ALTER TABLE `PasswordResetToken` DISABLE KEYS */;
/*!40000 ALTER TABLE `PasswordResetToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Project`
--

LOCK TABLES `Project` WRITE;
/*!40000 ALTER TABLE `Project` DISABLE KEYS */;
/*!40000 ALTER TABLE `Project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ProjectAgent`
--

LOCK TABLES `ProjectAgent` WRITE;
/*!40000 ALTER TABLE `ProjectAgent` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProjectAgent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ProjectAmenity`
--

LOCK TABLES `ProjectAmenity` WRITE;
/*!40000 ALTER TABLE `ProjectAmenity` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProjectAmenity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Property`
--

LOCK TABLES `Property` WRITE;
/*!40000 ALTER TABLE `Property` DISABLE KEYS */;
/*!40000 ALTER TABLE `Property` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `PropertyAgent`
--

LOCK TABLES `PropertyAgent` WRITE;
/*!40000 ALTER TABLE `PropertyAgent` DISABLE KEYS */;
/*!40000 ALTER TABLE `PropertyAgent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `PropertyAmenity`
--

LOCK TABLES `PropertyAmenity` WRITE;
/*!40000 ALTER TABLE `PropertyAmenity` DISABLE KEYS */;
/*!40000 ALTER TABLE `PropertyAmenity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `PropertyCategory`
--

LOCK TABLES `PropertyCategory` WRITE;
/*!40000 ALTER TABLE `PropertyCategory` DISABLE KEYS */;
INSERT INTO `PropertyCategory` (`id`, `name`, `slug`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmtxcfr9b0013ro5w1kv3ubjn','Residential','residential',1,'2026-09-11 19:22:52.223','2026-09-11 19:22:52.223'),('cmtxcfr9g0014ro5wkd82gf8o','Commercial','commercial',1,'2026-09-11 19:22:52.228','2026-09-11 19:22:52.228');
/*!40000 ALTER TABLE `PropertyCategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `PropertyFeature`
--

LOCK TABLES `PropertyFeature` WRITE;
/*!40000 ALTER TABLE `PropertyFeature` DISABLE KEYS */;
/*!40000 ALTER TABLE `PropertyFeature` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `PropertyType`
--

LOCK TABLES `PropertyType` WRITE;
/*!40000 ALTER TABLE `PropertyType` DISABLE KEYS */;
INSERT INTO `PropertyType` (`id`, `name`, `slug`, `category`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmtxcfr8s000yro5wbu5va5sg','Apartment','apartment','RESIDENTIAL',1,'2026-09-11 19:22:52.204','2026-09-11 19:22:52.204'),('cmtxcfr8w000zro5wz5i6s2lm','Villa','villa','RESIDENTIAL',1,'2026-09-11 19:22:52.209','2026-09-11 19:22:52.209'),('cmtxcfr900010ro5wwjtt9jlm','Studio','studio','RESIDENTIAL',1,'2026-09-11 19:22:52.212','2026-09-11 19:22:52.212'),('cmtxcfr940011ro5wacfxa817','Office Space','office-space','COMMERCIAL',1,'2026-09-11 19:22:52.216','2026-09-11 19:22:52.216'),('cmtxcfr970012ro5w5y16e5ze','Shop','shop','COMMERCIAL',1,'2026-09-11 19:22:52.219','2026-09-11 19:22:52.219');
/*!40000 ALTER TABLE `PropertyType` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Purpose`
--

LOCK TABLES `Purpose` WRITE;
/*!40000 ALTER TABLE `Purpose` DISABLE KEYS */;
INSERT INTO `Purpose` (`id`, `name`, `slug`, `isActive`, `createdAt`, `updatedAt`) VALUES ('cmtxcfr9l0015ro5wwhwjsnrv','Buy','buy',1,'2026-09-11 19:22:52.233','2026-09-11 19:22:52.233'),('cmtxcfr9p0016ro5wdbziogpk','Rent','rent',1,'2026-09-11 19:22:52.238','2026-09-11 19:22:52.238'),('cmtxcfr9s0017ro5wvdfvwsls','Lease','lease',1,'2026-09-11 19:22:52.241','2026-09-11 19:22:52.241');
/*!40000 ALTER TABLE `Purpose` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `RefreshToken`
--

LOCK TABLES `RefreshToken` WRITE;
/*!40000 ALTER TABLE `RefreshToken` DISABLE KEYS */;
/*!40000 ALTER TABLE `RefreshToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Setting`
--

LOCK TABLES `Setting` WRITE;
/*!40000 ALTER TABLE `Setting` DISABLE KEYS */;
/*!40000 ALTER TABLE `Setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `SiteVisit`
--

LOCK TABLES `SiteVisit` WRITE;
/*!40000 ALTER TABLE `SiteVisit` DISABLE KEYS */;
/*!40000 ALTER TABLE `SiteVisit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `State`
--

LOCK TABLES `State` WRITE;
/*!40000 ALTER TABLE `State` DISABLE KEYS */;
INSERT INTO `State` (`id`, `name`, `slug`, `countryId`, `createdAt`, `updatedAt`) VALUES ('cmtxcfr680002ro5wn9bb29d0','Maharashtra','maharashtra','cmtxcfr5x0000ro5whg9whfq2','2026-09-11 19:22:52.113','2026-09-11 19:22:52.113');
/*!40000 ALTER TABLE `State` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` (`id`, `name`, `email`, `phone`, `passwordHash`, `role`, `designation`, `bio`, `isActive`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmtxcfrhz0018ro5ws3fa1a58','Affan Shaikh','districtonerealty@gmail.com','9324702438','$2a$12$hZ.q8bzRpJkqw/oYGJi1GeRNSVUCd.iu0Q23awRmX5q8hR.EsCSia','SUPER_ADMIN','Real Estate Consultant',NULL,1,NULL,'2026-09-11 19:22:52.535','2026-09-11 19:22:52.535');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-12  0:53:03
