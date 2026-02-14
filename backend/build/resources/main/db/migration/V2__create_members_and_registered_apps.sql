-- Flyway migration V2: application tables + seed data

CREATE TABLE IF NOT EXISTS members (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  name VARCHAR(200),
  role VARCHAR(50),
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registered_apps (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  version VARCHAR(50),
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

INSERT INTO members (username, password, name, role)
VALUES
  ('admin', '$2b$12$.kZxr6Tn2m2V9BFtILpBeuRbE1WzMH74MTIx56C3eSFJNBZXwXk2m', 'Admin', 'ADMIN'),
  ('member', '$2b$12$k.TS.TUyS5ybZkPIwnOwp.VdUJG.2wy.CvaHrpySoRDmMY8eEEsru', 'Member', 'MEMBER'),
  ('tester', '$2b$12$coCzeeEp6HC0sv8WEdTBI.g0NB.ZqUGo899WFN2VyerInqq1kS1yK', 'Tester', 'TESTER')
AS new_values
ON DUPLICATE KEY UPDATE
  name = new_values.name,
  role = new_values.role;

INSERT INTO registered_apps (name, description, version)
SELECT 'Sample App', 'A sample registered application', '1.0.0'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM registered_apps WHERE name = 'Sample App' AND version = '1.0.0'
);
