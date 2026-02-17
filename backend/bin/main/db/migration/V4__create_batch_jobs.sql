-- Flyway migration V4: batch job management table

CREATE TABLE IF NOT EXISTS batch_jobs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    job_key VARCHAR(150) NOT NULL,
    job_class VARCHAR(255) NOT NULL,
    cron_expression VARCHAR(120) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    last_run_at DATETIME(6) DEFAULT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_batch_jobs_job_key UNIQUE (job_key)
) ENGINE=InnoDB;

INSERT INTO batch_jobs (name, job_key, job_class, cron_expression, enabled)
SELECT
    'Sample Job',
    'sampleJob',
    'com.example.demo.config.BatchConfig',
    '0 */5 * * * *',
    1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM batch_jobs
    WHERE job_key = 'sampleJob'
);

