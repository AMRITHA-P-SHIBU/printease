--1st commit--

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


--2nd commit--
USE printease;
ALTER TABLE users MODIFY branch VARCHAR(50) NULL;
ALTER TABLE users MODIFY year VARCHAR(10) NULL;

INSERT INTO users 
(full_name, email, username, branch, year, phone, password, role)
VALUES 
(
  'Admin1',
  'admin1@printease.com',
  'admin1',
  NULL,
  NULL,
  '9999999999',
  '$2b$10$zpbGRaKbj0.8A.cpB2RHLO40YvCiLRJgn3/9jnTEZBKL/HoL16gFi',
  'admin'
);
