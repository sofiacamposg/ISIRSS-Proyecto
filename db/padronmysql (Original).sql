-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: u460207423_agosto_2026
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `padron`
--

DROP TABLE IF EXISTS `padron`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `padron` (
  `id_infante` int(11) NOT NULL AUTO_INCREMENT,
  `id_benef_infante` int(5) NOT NULL,
  `matricula` int(10) NOT NULL DEFAULT 0,
  `ur` varchar(3) NOT NULL DEFAULT '',
  `ebdi` int(3) NOT NULL DEFAULT 0,
  `nombre` varchar(50) NOT NULL DEFAULT '',
  `paterno` varchar(50) NOT NULL DEFAULT '',
  `materno` varchar(50) NOT NULL DEFAULT '',
  `genero` varchar(1) NOT NULL,
  `curp` varchar(18) NOT NULL DEFAULT '',
  `fnac` date NOT NULL,
  `freg` date NOT NULL,
  `estatus_servicio` int(2) NOT NULL,
  `estrato` varchar(2) NOT NULL DEFAULT '',
  `fmovimiento` date NOT NULL,
  `movimiento` varchar(15) NOT NULL DEFAULT '',
  `movSiguiente` varchar(3) NOT NULL DEFAULT '',
  `fsistema` datetime NOT NULL DEFAULT current_timestamp(),
  `activo` int(1) NOT NULL DEFAULT 1,
  `puede_editar` int(11) NOT NULL DEFAULT 0,
  `idAnt` int(7) NOT NULL DEFAULT 0,
  `idPos` int(7) NOT NULL DEFAULT 0,
  `estratoAnt` varchar(3) NOT NULL DEFAULT '',
  `estratoPos` varchar(3) NOT NULL DEFAULT '',
  `fCambioEst_ini` date NOT NULL,
  `fCambioEst_fin` date NOT NULL,
  `ebdiAnt` varchar(3) NOT NULL DEFAULT '',
  `ebdiPos` varchar(3) NOT NULL DEFAULT '',
  `fCambioEbdi_ini` date NOT NULL,
  `fCambioEbdi_fin` date NOT NULL,
  `baja` int(1) NOT NULL DEFAULT 0,
  `fBaja` date NOT NULL,
  `motivoBaja` int(2) NOT NULL DEFAULT 0,
  `fCambio` date NOT NULL,
  `movimPrevio` varchar(5) NOT NULL DEFAULT '',
  `discapacidad` int(1) NOT NULL,
  `grupoDisc` varchar(25) NOT NULL DEFAULT '',
  `dif_cvrp` int(1) NOT NULL,
  `dif_cvfn` int(1) NOT NULL,
  `dif_pat` int(1) NOT NULL,
  `dif_mat` int(1) NOT NULL,
  `inscripcionInicial` varchar(15) NOT NULL DEFAULT '',
  `comentario` varchar(500) NOT NULL DEFAULT '',
  `inscIniOct` int(1) NOT NULL DEFAULT 0,
  `inscripIni10` int(11) NOT NULL DEFAULT 0,
  `inscripIni11` int(1) NOT NULL DEFAULT 0,
  `inscripIniSep21` int(1) DEFAULT 0,
  `usuario` varchar(50) NOT NULL,
  `inscripIni12` int(1) NOT NULL DEFAULT 0,
  `inscripIniEne21` int(1) NOT NULL DEFAULT 0,
  `inscripIniFeb21` int(11) NOT NULL DEFAULT 0,
  `inscripIniMarzo21` int(11) NOT NULL DEFAULT 0,
  `inscripIniAbril21` int(11) NOT NULL,
  `inscripIniMayo21` int(11) NOT NULL,
  `inscripIniJunio21` int(11) NOT NULL,
  `inscripIniJulio21` int(1) NOT NULL,
  `inscripIniAgos21` int(11) NOT NULL DEFAULT 0,
  `inscripIniOct21` int(11) NOT NULL DEFAULT 0,
  `inscripIniNov21` int(1) NOT NULL DEFAULT 0,
  `inscIniDic2021` int(1) NOT NULL,
  `inscIniEne2022` int(1) NOT NULL DEFAULT 0,
  `inscIniFeb2022` int(11) NOT NULL DEFAULT 0,
  `inscIniMarzo2022` int(11) NOT NULL DEFAULT 0,
  `inscIniAbril2022` int(1) NOT NULL DEFAULT 0,
  `inscIniMayo2022` int(11) NOT NULL DEFAULT 0,
  `RegPesoTalla` int(11) DEFAULT NULL,
  `inscIniJunio2022` int(1) NOT NULL DEFAULT 0,
  `inscIniJulio2022` int(1) NOT NULL DEFAULT 0,
  `inscIniAgosto2022` int(1) NOT NULL DEFAULT 0,
  `inscIniSep2022` int(1) NOT NULL DEFAULT 0,
  `inscIniOct2022` int(1) NOT NULL DEFAULT 0,
  `inscIniNov2022` int(1) NOT NULL DEFAULT 0,
  `inscIniDic2022` int(11) NOT NULL DEFAULT 0,
  `inscIniEne2023` int(1) NOT NULL DEFAULT 0,
  `inscIniFeb2023` int(11) NOT NULL DEFAULT 0,
  `inscIniMar2023` int(11) NOT NULL DEFAULT 0,
  `inscIniAbr2023` int(11) NOT NULL,
  `inscIniMay2023` int(11) NOT NULL,
  `inscIniJun2023` int(11) NOT NULL,
  `inscIniJul2023` int(11) NOT NULL,
  `inscIniAgo2023` int(11) NOT NULL,
  `inscIniSep2023` int(11) NOT NULL,
  `inscIniOct2023` int(11) NOT NULL,
  `inscIniNov2023` int(11) NOT NULL,
  `inscIniDic2023` int(11) NOT NULL,
  `inscIniEne2024` int(11) NOT NULL,
  `inscIniFeb2024` int(11) NOT NULL,
  `inscIniMar2024` int(11) NOT NULL,
  `inscIniAbr2024` int(11) NOT NULL,
  `inscIniMay2024` int(11) NOT NULL,
  `inscIniJun2024` int(11) NOT NULL,
  `inscIniJul2024` int(11) NOT NULL,
  `inscIniAgo2024` int(11) NOT NULL,
  `inscIniSep2024` int(11) NOT NULL,
  `inscIniOct2024` int(11) NOT NULL,
  `inscIniNov2024` int(11) NOT NULL,
  `InscIniDic2024` int(11) NOT NULL,
  `InscIniEne2025` int(11) NOT NULL,
  `InscIniFeb2025` int(11) NOT NULL,
  `InscIniMar2025` int(11) NOT NULL,
  `InscIniAbr2025` int(11) NOT NULL,
  `InscIniMay2025` int(11) DEFAULT 0,
  `InscIniJun2025` int(11) DEFAULT 0,
  `InscIniJul2025` int(11) DEFAULT 0,
  `InscIniAgo2025` int(11) DEFAULT 0,
  `InscIniSep2025` int(11) DEFAULT 0,
  `InscIniOct2025` int(11) DEFAULT 0,
  `InscIniNov2025` int(11) DEFAULT 0,
  `InscIniDic2025` int(11) DEFAULT 0,
  `InscIniEne2026` int(11) DEFAULT 0,
  `InscIniFeb2026` int(11) DEFAULT 0,
  `InscIniMar2026` int(11) DEFAULT 0,
  `InscIniAbr2026` int(11) DEFAULT 0,
  `InscIniMay2026` int(11) DEFAULT 0,
  `InscIniJun2026` int(11) DEFAULT 0,
  `InscIniJul2026` int(11) DEFAULT 0,
  `InscIniAgo2026` int(11) DEFAULT 0,
  PRIMARY KEY (`id_infante`)
) ENGINE=InnoDB AUTO_INCREMENT=199409 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-11 14:36:00
