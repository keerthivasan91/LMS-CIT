import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const limit = 10;

  const loadUsers = async () => {
    try {
      const res = await axios.get(
        `/admin/users?page=${page}&limit=${limit}&search=${search}&department=${department}`
      );

      setUsers(res.data.users || []);
      setDepartments(res.data.departments || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load users", err);
      setUsers([]);
    }
  };

  // Debounced loading
  useEffect(() => {
    const timer = setTimeout(loadUsers, 800);
    return () => clearTimeout(timer);
  }, [page, search, department]);

  const confirmDelete = (user) => {
    setSelectedUser(user);
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);
      await axios.delete(`/admin/delete-user/${selectedUser.user_id}`);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* ================= DELETE CONFIRMATION POPUP (OLD STYLE) ================= */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete user{" "}
              <b>{selectedUser.user_id}</b>?
            </p>

            <button
              onClick={deleteUser}
              disabled={deleting}
              className="delete-btn full-btn"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>

            <button
              onClick={() => setSelectedUser(null)}
              className="cancel-btn full-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="history-container">
        <h2>Users</h2>

        {/* Filters */}
        <div className="filters-bar">
          <input
            type="text"
            placeholder="Search by name, email, UserID"
            value={search}
            className="search-bar"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select className="filters-bar-select"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option
                key={d.department_code || d}
                value={d.department_code || d}
              >
                {d.department_name || d}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.department_code || "-"}</td>
                  <td>
                    <div className="action-btn">
                      <button
                        className="btn-approve"
                        onClick={() =>
                          (window.location.href = `/admin/users/${u.user_id}`)
                        }
                      >
                        View
                      </button>

                      {u.role !== "admin" && u.role !== "principal" && (
                        <button
                          onClick={() => confirmDelete(u)}
                          className="reject-btn"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button className="btn-pagination"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button className="btn-pagination"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsers;
