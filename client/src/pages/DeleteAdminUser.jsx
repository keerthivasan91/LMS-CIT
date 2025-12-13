import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { useSnackbar } from "../context/SnackbarContext";
import "../App.css"; // IMPORT CSS FILE

const DeleteAdminUser = () => {
  const { user } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar(); 

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setMessage("");
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);
      await axios.delete(`/admin/delete-user/${selectedUser.user_id}`);

      showSnackbar(`User ${selectedUser.user_id} deleted successfully`, "success");
      setUsers(users.filter((u) => u.user_id !== selectedUser.user_id));
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete user", "error");
    }

    setDeleting(false);
  };

  const filteredUsers = users.filter((u) =>
    `${u.user_id} ${u.name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="delete-admin-container">
      <h2>Delete User (Admin / Principal)</h2>


      <input
        type="text"
        placeholder="Search user by ID or name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.name}</td>
                <td>{u.department_code || "-"}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    onClick={() => confirmDelete(u)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* DELETE CONFIRMATION POPUP */}
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
    </div>
  );
};

export default DeleteAdminUser;
