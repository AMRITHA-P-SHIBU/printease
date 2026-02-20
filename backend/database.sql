-- Select / create database
CREATE DATABASE IF NOT EXISTS printease;
USE printease;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  branch VARCHAR(50) NOT NULL,
  year VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student'
);

-- Optional: check content
-- SELECT * FROM users;