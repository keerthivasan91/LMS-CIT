# Backup Retention Policy – LMS

## 1. Purpose

This document defines the **backup retention and deletion policy** for the
Faculty Leave Management System (LMS).

The objective is to:
- Prevent disk exhaustion
- Maintain sufficient recovery points
- Ensure compliance with institutional record requirements
- Balance storage cost and recovery capability

---

## 2. Scope

This policy applies to:
- Database backups
- Application and file backups
- Configuration backups
- Backup logs
- Off-site backup copies

This policy applies to **all production environments**.

---

## 3. Retention Strategy Overview

Backups are retained based on **time-based criteria**, not disk size.

The system follows:
- Multiple recovery points
- Separate retention windows per backup type
- Automated cleanup via cron jobs

---

## 4. Retention Rules

### 4.1 Database Backups

| Backup Type | Frequency | Retention Period |
|---|---|---|
| Daily full backup | Daily | 30 days |
| Weekly full backup | Weekly | 90 days |

Rules:
- At least one recent daily backup must always exist
- Weekly backups must not be deleted before daily backups expire
- Backups are compressed and checksum-verified

---

### 4.2 Application Backups

| Item | Frequency | Retention |
|---|---|---|
| Backend + frontend | Weekly | 60 days |
| User uploads | Weekly | 60 days |

Rules:
- Application backups supplement GitHub source control
- Backups are required for restoring runtime state

---

### 4.3 Configuration Backups

| Item | Frequency | Retention |
|---|---|---|
| Environment files | Weekly | 90 days |
| Nginx configuration | Weekly | 90 days |
| Cron definitions | Weekly | 90 days |

Rules:
- Configuration backups are critical for fast recovery
- Secrets are protected with restricted permissions

---

### 4.4 Logs

| Log Type | Retention |
|---|---|
| Backup execution logs | 14 days |
| Application logs | As per application policy |

---

### 4.5 Off-Site Backups

| Location | Retention |
|---|---|
| Google Drive | ≥ 90 days |
| Physical server | As per institutional policy |

Rules:
- Off-site backups must outlive on-server backups
- At least one off-site copy must always exist

---

## 5. Deletion Criteria

Backups are deleted when:
- Retention period is exceeded
- Backup integrity is verified
- A newer valid backup exists

Deletion is:
- Fully automated
- Logged
- Time-based

Manual deletion is prohibited unless authorized.

---

## 6. Cleanup Automation

Cleanup is performed via:
- Scheduled cron jobs
- OS-level file age checks (`mtime`)
- Folder-based isolation

Dry-run validation is required before enabling deletion.

---

## 7. Compliance & Audit

- Backup retention compliance is reviewed quarterly
- Cleanup logs are retained for audit purposes
- Deviations must be documented and approved

---

## 8. Exception Handling

Exceptions to this policy may occur during:
- Legal audits
- Institutional data requests
- Extended investigations

Such exceptions must be:
- Documented
- Time-bound
- Approved by system owner

---

## 9. Review Policy

This policy must be reviewed:
- Every 6 months
- After major infrastructure changes
- After disaster recovery incidents

---

## 10. Ownership

This retention policy is owned by:
- LMS System Administrator
- Infrastructure Owner

Unauthorized modification of this policy is prohibited.
