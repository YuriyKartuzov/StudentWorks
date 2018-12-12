-- MySQL dump 10.13  Distrib 5.7.23, for Linux (x86_64)
--
-- Host: localhost    Database: sw
-- ------------------------------------------------------
-- Server version	5.7.23-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project` (
  `projectID` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `description` text,
  `creationDate` date DEFAULT NULL,
  `language` varchar(50) DEFAULT NULL,
  `framework` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `ImageFilePath` char(255) NOT NULL,
  `VideoFilePath` char(255) NOT NULL,
  `status` enum('approved','pending') NOT NULL,
  `platform` varchar(50) DEFAULT NULL,
  `color` varchar(10) DEFAULT '#f5f5f5',
  `git` text,
  `developers` text,
  PRIMARY KEY (`projectID`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (1,'Conteract','This is a webapp to connect employees with potential employers.','2018-07-29','Javascript','Vue.js','Commerce','ConteractSmall.jpg','Conteract.mp4','approved','Web',NULL,NULL,'Adam Chimienti, Anthony LoMagno, James Clarke'),(2,'The Last Transmission','Last Transmission is a top down survival shooter with elements of a rogue-llike. The game\'s story is that you are a survivor of a virus outbreak that consumed the city you live in. Your objective is to get to the center of the city to reach a radio tower to broadcast a signal to the military for help. You will need to scavenge the area for any supplies that will assist your journey, and you need to find gas to fuel your car to allow you to travel to the next area. As you explore you will encounter the infected and the scavs - a group of bandits that raid and loot the city for their own benefit. If you die, you start from the beginning. If you succeed, you will unlock more powerful items for you to find on your next playthrough.','2018-07-29','C#','Unity','Game','TheLastTransmissionSmall.jpg','TheLastTransmission.mp4','approved','PC',NULL,NULL,'Kevin Cho, Matt Rajevski, Parmjot Sabharwal, Lucas Verbeke'),(3,'Solitary','Solitary is a 2D side scrolling platform puzzler. It is set in a Sci-fi themed universe. Your character Cliff Nova, must navigate through his ship and repair broken parts in order to escape and complete his mission. ','2018-07-29','C#','Unity','Game','SolitarySmall.jpg','Solitary.mp4','approved','PC',NULL,NULL,'Jacob Holland, Leonel Jara, Nathan Misener, Anthony Nguyen'),(4,'Kitchen Art','A utility that allows set the size of the kitchen and position appliances & furniture to make sure everything fits. You can also set windows and doors for an accurate representation.','2006-05-01','Visual Basic','VB.NET','Utility','KitchenSmall.png','Kitchen.mp4','approved','PC',NULL,'https://github.com/StudentWorksClub/KitchenArt-2006','Dmitry Srybnik'),(5,'Arcanoid Game','A version of the popular arcanoid game from the 80s','2007-05-01','C++',NULL,'Game','ArcanoidSmall.png','Arcanoid.mp4','approved','PC',NULL,'https://github.com/StudentWorksClub/Arcanoid-2007','Dmitry Srybnik');
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `userID` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(30) DEFAULT NULL,
  `lastName` varchar(30) DEFAULT NULL,
  `password` char(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `userName` varchar(30) NOT NULL,
  `userType` enum('Visitor','Contributor','Admin') DEFAULT NULL,
  `program` varchar(255) DEFAULT NULL,
  `registrationStatus` tinyint(1) DEFAULT NULL,
  `registrationDate` date NOT NULL,
  `registrationCode` char(65) DEFAULT NULL,
  `imagePath` char(255) DEFAULT NULL,
  `userDescription` text,
  `profilePic` text,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `userName` (`userName`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (12,'Yuriy','Kartuzov','yuriyA','kyuriy@myseneca.ca','yuriyA','Admin','CPA, may be BSD',1,'2018-07-29','12345','1533500939683.jpeg','',NULL),(13,'student','student','student','allstudents@myseneca.ca','student','Contributor','CPA, BSD',1,'2018-08-01',NULL,'1533336424130.png','',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userProject`
--

DROP TABLE IF EXISTS `userProject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userProject` (
  `bridgeId` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `projectID` int(11) NOT NULL,
  PRIMARY KEY (`bridgeId`),
  KEY `userID` (`userID`),
  KEY `projectID` (`projectID`),
  CONSTRAINT `BRIDGE_USERS_PROJECTS_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userProject`
--

LOCK TABLES `userProject` WRITE;
/*!40000 ALTER TABLE `userProject` DISABLE KEYS */;
INSERT INTO `userProject` VALUES (3,12,46),(4,12,47),(5,12,48),(6,13,49),(7,13,50);
/*!40000 ALTER TABLE `userProject` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-08-08 17:45:03
