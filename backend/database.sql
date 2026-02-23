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


--3rd commit--
USE printease;

CREATE TABLE IF NOT EXISTS print_requests (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  file_path   VARCHAR(255) NOT NULL,
  mode        VARCHAR(50)  NOT NULL,
  copies      INT          NOT NULL DEFAULT 1,
  print_type  VARCHAR(50)  NOT NULL,
  page_numbers VARCHAR(100) DEFAULT NULL,
  description TEXT         DEFAULT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

--cd backend, run npm install multer--

--4th commit--
ALTER TABLE print_requests 
ADD COLUMN amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';


--5th commit--
-- ── ALTER existing table ──
ALTER TABLE print_requests
ADD COLUMN total_pages    INT     NOT NULL DEFAULT 1,
ADD COLUMN spiral_binding BOOLEAN NOT NULL DEFAULT FALSE;

-- ── (DONOT RUN!!!)Full updated CREATE TABLE (for reference) ──
CREATE TABLE IF NOT EXISTS print_requests (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  file_path      VARCHAR(255)  NOT NULL,
  mode           VARCHAR(50)   NOT NULL,
  copies         INT           NOT NULL DEFAULT 1,
  print_type     VARCHAR(50)   NOT NULL,
  page_numbers   VARCHAR(100)  DEFAULT NULL,
  description    TEXT          DEFAULT NULL,
  total_pages    INT           NOT NULL DEFAULT 1,
  spiral_binding BOOLEAN       NOT NULL DEFAULT FALSE,
  amount         DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(20)   DEFAULT 'pending',
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Also add print_status column if not already present
ALTER TABLE print_requests
ADD COLUMN print_status VARCHAR(20) DEFAULT 'Pending';