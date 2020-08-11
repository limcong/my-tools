/*
Navicat MySQL Data Transfer

Source Server         : mysql
Source Server Version : 50520
Source Host           : localhost:3306
Source Database       : test

Target Server Type    : MYSQL
Target Server Version : 50520
File Encoding         : 65001

Date: 2020-08-11 11:12:55
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `testable`
-- ----------------------------
DROP TABLE IF EXISTS `testable`;
CREATE TABLE `testable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `state` int(2) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of testable
-- ----------------------------
INSERT INTO `testable` VALUES ('1', 'lemon', '1');
INSERT INTO `testable` VALUES ('2', '3', '1');
INSERT INTO `testable` VALUES ('4', 'test', '1');
