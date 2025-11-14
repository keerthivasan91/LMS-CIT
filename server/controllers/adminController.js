const pool = require('../config/db');

/* -------------------------------------------------------
   ADMIN / PRINCIPAL DASHBOARD
--------------------------------------------------------*/
async function adminDashboard(req, res, next) {
    try {
        if (!['admin', 'principal'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const selectedDepartment = req.query.department || null;

        // Requests waiting for Principal approval
        const [requests] = await pool.query(
            `SELECT 
                lr.leave_id,
                lr.user_id,
                lr.department_code,
                lr.leave_type,
                lr.start_date,
                lr.start_session,
                lr.end_date,
                lr.end_session,
                lr.reason,
                lr.days,
                lr.substitute_id,
                lr.substitute_status,
                lr.hod_status,
                lr.principal_status,
                lr.final_status,
                lr.applied_on,
                u1.name AS requester_name,
                u2.name AS substitute_name
            FROM leave_requests lr
            LEFT JOIN users u1 ON lr.user_id = u1.user_id
            LEFT JOIN users u2 ON lr.substitute_id = u2.user_id
            WHERE lr.hod_status = 'approved'
              AND lr.principal_status = 'pending'
            ORDER BY lr.applied_on DESC`
        );

        // Optional department filter
        let query = `
            SELECT 
                lr.*,
                u1.name AS requester_name,
                u2.name AS substitute_name
            FROM leave_requests lr
            LEFT JOIN users u1 ON lr.user_id = u1.user_id
            LEFT JOIN users u2 ON lr.substitute_id = u2.user_id
        `;

        const params = [];
        if (selectedDepartment) {
            query += " WHERE lr.department_code = ?";
            params.push(selectedDepartment);
        }

        query += " ORDER BY lr.applied_on DESC";

        const [institution_leaves] = await pool.query(query, params);

        res.json({ requests, institution_leaves });

    } catch (err) {
        next(err);
    }
}

/* -------------------------------------------------------
   PRINCIPAL APPROVE LEAVE
--------------------------------------------------------*/
async function approvePrincipal(req, res, next) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const leaveId = req.params.id;

        await pool.query(
            `UPDATE leave_requests 
             SET principal_status='approved',
                 final_status='approved',
                 processed_on = NOW()
             WHERE leave_id = ?`,
            [leaveId]
        );

        res.json({ ok: true });

    } catch (err) {
        next(err);
    }
}

/* -------------------------------------------------------
   PRINCIPAL REJECT LEAVE
--------------------------------------------------------*/
async function rejectPrincipal(req, res, next) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const leaveId = req.params.id;

        await pool.query(
            `UPDATE leave_requests 
             SET principal_status='rejected',
                 final_status='rejected',
                 processed_on = NOW()
             WHERE leave_id = ?`,
            [leaveId]
        );

        res.json({ ok: true });

    } catch (err) {
        next(err);
    }
}

module.exports = {
    adminDashboard,
    approvePrincipal,
    rejectPrincipal
};
