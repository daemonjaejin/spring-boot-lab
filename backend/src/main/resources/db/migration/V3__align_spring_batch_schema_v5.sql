-- Flyway migration V3: align legacy Batch schema with Spring Batch 5.x (MySQL)

-- BATCH_STEP_EXECUTION: CREATE_TIME was added in Spring Batch 5
SET @has_step_create_time := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_STEP_EXECUTION'
      AND column_name = 'CREATE_TIME'
);
SET @sql := IF(
    @has_step_create_time = 0,
    'ALTER TABLE BATCH_STEP_EXECUTION ADD COLUMN CREATE_TIME DATETIME(6) NOT NULL DEFAULT ''1970-01-01 00:00:00'' AFTER JOB_EXECUTION_ID',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @start_time_not_nullable := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_STEP_EXECUTION'
      AND column_name = 'START_TIME'
      AND is_nullable = 'NO'
);
SET @sql := IF(
    @start_time_not_nullable = 1,
    'ALTER TABLE BATCH_STEP_EXECUTION MODIFY COLUMN START_TIME DATETIME(6) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- BATCH_JOB_EXECUTION_PARAMS: Spring Batch 5 parameter column names
SET @has_legacy_params := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_JOB_EXECUTION_PARAMS'
      AND column_name = 'KEY_NAME'
);
SET @sql := IF(
    @has_legacy_params = 1,
    'ALTER TABLE BATCH_JOB_EXECUTION_PARAMS
       CHANGE COLUMN TYPE_CD PARAMETER_TYPE VARCHAR(100) NOT NULL,
       CHANGE COLUMN KEY_NAME PARAMETER_NAME VARCHAR(100) NOT NULL,
       CHANGE COLUMN STRING_VAL PARAMETER_VALUE VARCHAR(2500) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_date_val := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_JOB_EXECUTION_PARAMS'
      AND column_name = 'DATE_VAL'
);
SET @sql := IF(
    @has_date_val = 1,
    'ALTER TABLE BATCH_JOB_EXECUTION_PARAMS DROP COLUMN DATE_VAL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_long_val := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_JOB_EXECUTION_PARAMS'
      AND column_name = 'LONG_VAL'
);
SET @sql := IF(
    @has_long_val = 1,
    'ALTER TABLE BATCH_JOB_EXECUTION_PARAMS DROP COLUMN LONG_VAL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_double_val := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_JOB_EXECUTION_PARAMS'
      AND column_name = 'DOUBLE_VAL'
);
SET @sql := IF(
    @has_double_val = 1,
    'ALTER TABLE BATCH_JOB_EXECUTION_PARAMS DROP COLUMN DOUBLE_VAL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Sequence tables: Spring Batch 5 uses UNIQUE_KEY column and BATCH_JOB_SEQ
SET @step_seq_has_unique_key := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_STEP_EXECUTION_SEQ'
      AND column_name = 'UNIQUE_KEY'
);
SET @sql := IF(
    @step_seq_has_unique_key = 0,
    'ALTER TABLE BATCH_STEP_EXECUTION_SEQ ADD COLUMN UNIQUE_KEY CHAR(1) NOT NULL DEFAULT ''0''',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @step_seq_has_unique_index := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_STEP_EXECUTION_SEQ'
      AND column_name = 'UNIQUE_KEY'
      AND non_unique = 0
);
SET @sql := IF(
    @step_seq_has_unique_index = 0,
    'ALTER TABLE BATCH_STEP_EXECUTION_SEQ ADD CONSTRAINT BATCH_STEP_EXECUTION_SEQ_UK UNIQUE (UNIQUE_KEY)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO BATCH_STEP_EXECUTION_SEQ (ID, UNIQUE_KEY)
SELECT 0, '0'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM BATCH_STEP_EXECUTION_SEQ
    WHERE UNIQUE_KEY = '0'
);

SET @job_exec_seq_has_unique_key := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_JOB_EXECUTION_SEQ'
      AND column_name = 'UNIQUE_KEY'
);
SET @sql := IF(
    @job_exec_seq_has_unique_key = 0,
    'ALTER TABLE BATCH_JOB_EXECUTION_SEQ ADD COLUMN UNIQUE_KEY CHAR(1) NOT NULL DEFAULT ''0''',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @job_exec_seq_has_unique_index := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'BATCH_JOB_EXECUTION_SEQ'
      AND column_name = 'UNIQUE_KEY'
      AND non_unique = 0
);
SET @sql := IF(
    @job_exec_seq_has_unique_index = 0,
    'ALTER TABLE BATCH_JOB_EXECUTION_SEQ ADD CONSTRAINT BATCH_JOB_EXECUTION_SEQ_UK UNIQUE (UNIQUE_KEY)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO BATCH_JOB_EXECUTION_SEQ (ID, UNIQUE_KEY)
SELECT 0, '0'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM BATCH_JOB_EXECUTION_SEQ
    WHERE UNIQUE_KEY = '0'
);

CREATE TABLE IF NOT EXISTS BATCH_JOB_SEQ (
    ID BIGINT NOT NULL,
    UNIQUE_KEY CHAR(1) NOT NULL,
    CONSTRAINT BATCH_JOB_SEQ_UK UNIQUE (UNIQUE_KEY)
) ENGINE=InnoDB;

INSERT INTO BATCH_JOB_SEQ (ID, UNIQUE_KEY)
SELECT COALESCE((SELECT MAX(ID) FROM BATCH_JOB_INSTANCE_SEQ), 0), '0'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM BATCH_JOB_SEQ
    WHERE UNIQUE_KEY = '0'
);
