# Disaster Recovery Plan – LMS (Single VPS)

## 1. Purpose

This document defines the disaster recovery (DR) procedure for the LMS (Faculty Leave Management System) deployed on a single VPS.

### Goals

- Recover from complete server failure
- Prevent permanent data loss
- Restore LMS service with minimal downtime
- Ensure data integrity and auditability

### Assumptions

- Application code is versioned in GitHub
- Backups are stored off-site (Google Drive + physical server)
- Infrastructure backup scripts are versioned in the `infra/` folder

---

## 2. Disaster Scenarios Covered

This plan applies to the following situations:

- VPS hardware failure
- Disk corruption or accidental deletion
- OS crash or misconfiguration
- Application data corruption
- Complete loss of the primary server

---

## 3. Recovery Prerequisites

Before starting recovery, ensure access to:

- **GitHub repositories:**
  - LMS application repository
  - Infrastructure (infra) repository
- **Google Drive** backup account
- **College physical backup server** (if applicable)
- **Database credentials** (stored securely)
- **SSH access** to the new VPS

---

## 4. Recovery Time Objectives

| Item                    | Target          |
|-------------------------|-----------------|
| Infrastructure restore  | 30–45 minutes   |
| Database restore        | 15–30 minutes   |
| Application restore     | 15 minutes      |
| **Total recovery time** | **≤ 2 hours**   |

---

## 5. Step-by-Step Recovery Procedure

### Step 1: Provision a New VPS

- Create a new VPS with the same OS (recommended: Ubuntu LTS)
- Assign static IP if available
- Configure firewall and SSH access

---

### Step 2: Install System Dependencies

```bash
sudo apt update
sudo apt install -y git mysql-server nginx nodejs npm rclone
```

Verify installations:

```bash
mysql --version
node --version
nginx -v
```

---

### Step 3: Clone Repositories

```bash
git clone <LMS_APPLICATION_REPO_URL>
git clone <LMS_INFRA_REPO_URL>
```

---

### Step 4: Restore Infrastructure Scripts

```bash
sudo mkdir -p /opt/lms-backup
sudo cp infra/backup/scripts/* /opt/lms-backup/
sudo chmod +x /opt/lms-backup/*.sh
```

---

### Step 5: Restore Environment Configuration

Create backup environment file:

```bash
sudo nano /etc/lms-backup.env
```

Add required variables:

```bash
DB_HOST=localhost
DB_USER=lms_user
DB_PASS=********
DB_NAME=lms_db
BACKUP_DIR=/backups
```

Set permissions:

```bash
sudo chmod 600 /etc/lms-backup.env
```

---

### Step 6: Restore Database

Download latest backup from Google Drive or physical server.

Create database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE lms_db;
EXIT;
```

Restore backup:

```bash
gunzip < lms_db_YYYY-MM-DD.sql.gz | mysql -u lms_user -p lms_db
```

---

### Step 7: Restore Application Files

**For Docker deployment:**

```bash
cd LMS-CIT
docker-compose up -d
```

**For non-Docker deployment:**

```bash
cd server
npm install
npm start
```

---

### Step 8: Restore Nginx and SSL

```bash
sudo cp nginx/nginx.conf /etc/nginx/sites-available/lms
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

Verify:

```bash
curl http://localhost
```

---

### Step 9: Re-enable Cron Jobs

```bash
crontab infra/backup/cron/crontab.example
```

Verify:

```bash
crontab -l
```

---

## 6. Post-Recovery Validation Checklist

- [ ] LMS login works
- [ ] Leave balances are correct
- [ ] Leave history is intact
- [ ] New leave request works
- [ ] Cron jobs are active
- [ ] Backup scripts execute successfully

---

## 7. Recovery Failure Handling

If recovery fails:

1. Stop application
2. Re-verify database restore
3. Restore from previous backup
4. Check logs in `/backups/logs`
5. Escalate to system administrator

---

## 8. Documentation & Audit

After recovery, document:

- Incident details
- Root cause
- Downtime duration
- Updates to DR documentation (if needed)

---

## 9. Review & Testing

- Disaster recovery must be **tested at least once every 3 months**
- Any change in infrastructure must **update this document**
- Test restores should be **logged and reviewed**

---

## 10. Ownership

This disaster recovery plan is owned by:

- **System Administrator**
- **LMS Backend Maintainer**

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0     | TBD  | TBD    | Initial version |

---

**Last Updated:** February 2026  
**Next Review Date:** TBD