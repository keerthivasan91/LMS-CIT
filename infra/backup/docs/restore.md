# LMS Restore Procedure (Operational SOP)

## Purpose

This document describes the **exact steps to restore the LMS** from backups.

It is intended for **fast execution during incidents**, not explanation.

### Use this when:

- Data is corrupted
- Database is accidentally deleted
- VPS is rebuilt
- Partial recovery is required

---

## Preconditions

Ensure you have:

- ✅ SSH access to the server
- ✅ Database credentials
- ✅ Latest backup files (local / Google Drive / physical server)
- ✅ LMS application repository cloned
- ✅ Infra backup scripts available

---

## 1. Stop Running Services

```bash
docker-compose down
```

**OR** (non-docker):

```bash
pm2 stop all
```

---

## 2. Prepare Database

Login to MySQL:

```bash
mysql -u root -p
```

Drop corrupted database (if exists):

```sql
DROP DATABASE IF EXISTS lms_db;
CREATE DATABASE lms_db;
EXIT;
```

---

## 3. Restore Database Backup

Identify latest backup:

```bash
ls -lh /backups/db/daily
```

Restore:

```bash
gunzip < lms_YYYY-MM-DD.sql.gz | mysql -u lms_user -p lms_db
```

> **📌 Note:** If restore fails, try the previous backup.

---

## 4. Verify Database Integrity

```bash
mysql -u lms_user -p lms_db
```

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM leave_requests;
EXIT;
```

---

## 5. Restore Application Files (If Required)

Restore app backup:

```bash
tar -xzf lms_app_YYYY-MM-DD.tar.gz -C /var/www/
```

> **📌 Note:** Skip this step if code is redeployed from GitHub.

---

## 6. Restore Environment Variables

Ensure `.env` files exist:

```bash
ls server/.env
```

If missing:

```bash
cp /secure-location/.env server/.env
```

Set permissions:

```bash
chmod 600 server/.env
```

---

## 7. Restore Nginx (If Required)

```bash
sudo cp nginx/nginx.conf /etc/nginx/sites-available/lms
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## 8. Start Application

**For Docker:**

```bash
docker-compose up -d
```

**OR (non-Docker):**

```bash
npm start
```

---

## 9. Post-Restore Validation Checklist

- [ ] Login works
- [ ] Leave balances match expectations
- [ ] Leave history visible
- [ ] New leave request can be submitted
- [ ] Admin approval works
- [ ] No errors in logs

Check logs:

```bash
tail -n 50 server/logs/error.log
```

---

## 10. Re-enable Backup Cron Jobs

```bash
crontab -l
```

If missing:

```bash
crontab infra/backup/cron/crontab.example
```

---

## 11. Failure Handling

If restore fails:

1. **Stop services**
2. **Restore from an older backup**
3. **Check MySQL logs:**
   ```bash
   sudo tail -n 100 /var/log/mysql/error.log
   ```
4. **Verify disk space:**
   ```bash
   df -h
   ```
5. **Escalate to system administrator**

---

## 12. After Action

Document the following:

- [ ] Restore date and time
- [ ] Reason for restore
- [ ] Backup file used
- [ ] Root cause investigation
- [ ] Documentation updates (if needed)

---

## Quick Reference Card

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `docker-compose down` | Stop services |
| 2 | `DROP DATABASE lms_db; CREATE DATABASE lms_db;` | Reset DB |
| 3 | `gunzip < backup.sql.gz \| mysql -u user -p db` | Restore DB |
| 4 | `SELECT COUNT(*) FROM users;` | Verify data |
| 8 | `docker-compose up -d` | Start services |

---

## Emergency Contacts

| Role | Contact |
|------|---------|
| System Administrator | TBD |
| Database Administrator | TBD |
| LMS Backend Maintainer | TBD |

---

**Last Updated:** February 2026  
**Version:** 1.0  
**Owner:** System Administrator & LMS Backend Team