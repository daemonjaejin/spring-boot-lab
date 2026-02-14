# Demo Project

Spring Boot + React(TypeScript) 예제 프로젝트입니다.

## 프로젝트 구조
- `backend`: Spring Boot API (JWT, Flyway, Spring Batch)
- `frontend`: React + Vite + TypeScript
- `docker-compose.yml`: MySQL 실행 파일

## 로컬 설정
DB/JWT 값은 하드코딩하지 않고 `backend/src/main/resources/application-local.yml`에 입력합니다.

예시:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:13307/test
    username: root
    password: your-password
```

## 실행
1. Backend

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

## 기본 계정
- `admin / admin123` (ADMIN)
- `member / member123` (MEMBER)
- `tester / tester123` (TESTER)

## Spring Batch 테이블 생성 방식
이 프로젝트는 Flyway로 Spring Batch 메타 테이블을 생성/관리합니다.

- 마이그레이션 파일
  - `backend/src/main/resources/db/migration/V1__spring_batch_schema.sql`
  - `backend/src/main/resources/db/migration/V3__align_spring_batch_schema_v5.sql`
  - `backend/src/main/resources/db/migration/V4__create_batch_jobs.sql`
- 애플리케이션 테이블 + seed
  - `backend/src/main/resources/db/migration/V2__create_members_and_registered_apps.sql`

### 왜 V3가 필요한가
초기 V1 스키마(구버전)와 Spring Batch 5 런타임 기대 스키마가 달라서, `BATCH_JOB_SEQ`/파라미터 컬럼 구조 불일치로 배치 실행 시 오류가 발생할 수 있습니다.  
V3에서 Spring Batch 5 기준으로 스키마를 정렬합니다.

## 확인 방법
MySQL 접속 후 아래 SQL로 생성 여부를 확인합니다.

```sql
SHOW TABLES LIKE 'BATCH%';
SHOW TABLES LIKE 'members';
SHOW TABLES LIKE 'registered_apps';
SHOW TABLES LIKE 'batch_jobs';
```

또는:

```sql
SELECT TABLE_NAME
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND TABLE_NAME LIKE 'BATCH%';
```

Flyway 적용 이력 확인:

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

## Batch 관리 기능
`batch_jobs` 테이블을 통해 "시스템이 관리하는 Job 정의"를 CRUD 합니다.  
`BATCH_*` 메타 테이블을 직접 편집하지 않습니다.

### 주요 API
- `GET /api/batch/jobs` (ADMIN, MEMBER)
- `POST /api/batch/jobs` (ADMIN)
- `GET /api/batch/jobs/{id}` (ADMIN, MEMBER)
- `PUT /api/batch/jobs/{id}` (ADMIN)
- `DELETE /api/batch/jobs/{id}` (ADMIN)
- `POST /api/batch/jobs/{id}/run` (ADMIN)
- `GET /api/batch/executions` (ADMIN, MEMBER)

### 권한
- ADMIN: 등록/상세/수정/삭제/즉시실행 가능
- MEMBER: 조회만 가능
- TESTER: Batch 메뉴/라우팅/API 접근 불가(403)

### 등록 검증
등록/수정 시 아래를 검증합니다.
- `job_class`가 실제 클래스인지 (`Class.forName`)
- `job_key`에 해당하는 Spring Batch Job Bean이 등록되어 있는지
- cron 표현식이 유효한지 (5-field/6-field 모두 허용, 내부 저장은 6-field 기준)

## 프론트 Batch 화면
`/batch`에서 아래를 제공합니다.
- Job Definition 테이블
- 등록/상세/수정/삭제
- Admin 전용 Run 버튼
- 스케줄 입력
  - Easy: 요일 + 시/분 선택
  - Cron: 직접 문자열 입력
- 실행 이력 테이블
- loading/success/empty/error 상태 처리

## 문제 발생 시 체크 포인트
1. DB 권한
- 테이블 생성/ALTER 권한이 있는 계정인지 확인

2. DB 스키마
- `application-local.yml`의 DB URL이 실제 대상 DB인지 확인

3. Flyway 실패 이력
- `flyway_schema_history`에서 `success=0` 레코드가 있으면 재기동 시 마이그레이션이 멈춥니다.
- 실패 원인 조치 후 `repair` 또는 실패 행 정리가 필요합니다.

4. Spring Batch 스키마 버전
- Spring Batch 5 사용 시 `BATCH_JOB_SEQ`, `PARAMETER_NAME/PARAMETER_TYPE/PARAMETER_VALUE` 구조가 있어야 합니다.

5. Batch 실행 500
- `Existing transaction detected in JobRepository`가 보이면 Job 실행 메서드에 `@Transactional`이 걸려있는지 확인합니다.

## 검증 시나리오
아래 시나리오로 동작을 확인할 수 있습니다.

1. ADMIN 등록(존재하는 클래스)
- `POST /api/batch/jobs`
- 예: `jobKey=sampleJobTwo`, `jobClass=com.example.demo.config.BatchConfig`
- 기대: `200` 성공

2. ADMIN 등록(없는 클래스)
- `POST /api/batch/jobs`
- 예: `jobClass=com.example.demo.batch.NoSuchJobClass`
- 기대: `400` + `Job class not found`

3. MEMBER 등록 시도
- `POST /api/batch/jobs`
- 기대: `403`

4. TESTER batch 접근
- `GET /api/batch/jobs`
- 기대: `403` (프론트에서는 메뉴/라우트 차단)

5. ADMIN Run 실행
- `POST /api/batch/jobs/{id}/run`
- 기대: `200`, 실행 이력(`GET /api/batch/executions`) 증가
