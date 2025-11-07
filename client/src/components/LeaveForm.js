import { useState, useEffect } from 'react';

const ApplyLeave = ({ session }) => {
  const [formData, setFormData] = useState({
    leave_type: 'Casual Leave',
    start_date: '',
    start_session: 'Forenoon',
    end_date: '',
    end_session: 'Forenoon',
    days: 1,
    reason: '',
    substitute_user_id: '',
    alternate: '',
    department_select: ''
  });

  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/branches');
        const data = await response.json();
        setDepartments(data.branches);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    if (session.role !== 'staff') {
      fetchDepartments();
    }
  }, [session.role]);

  // Fetch all faculty for staff role
  useEffect(() => {
    const fetchAllFaculty = async () => {
      try {
        // You'll need to implement this API endpoint
        const response = await fetch('/api/all-faculty');
        const data = await response.json();
        setAllFaculty(data.faculty);
      } catch (error) {
        console.error('Error fetching faculty:', error);
      }
    };

    if (session.role === 'staff') {
      fetchAllFaculty();
    }
  }, [session.role]);

  // Fetch staff when department is selected
  useEffect(() => {
    const fetchStaff = async () => {
      if (!formData.department_select) {
        setStaff([]);
        return;
      }

      try {
        const response = await fetch(`/api/staff/${formData.department_select}`);
        const data = await response.json();
        setStaff(data.staff);
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    if (session.role !== 'staff') {
      fetchStaff();
    }
  }, [formData.department_select, session.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Leave application submitted successfully!');
        // Reset form or redirect as needed
      } else {
        alert('Error submitting leave application');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting leave application');
    }
  };

  return (
    <div className="apply-leave-container">
      <div className="apply-leave-card">
        <h2>Apply for Leave</h2>
        <form onSubmit={handleSubmit}>
          <label>Leave Type</label>
          <select 
            name="leave_type" 
            value={formData.leave_type} 
            onChange={handleInputChange}
            required
          >
            <option>Casual Leave</option>
            <option>Earned Leave</option>
            <option>OOD</option>
            <option>Permitted Leave</option>
            <option>Special Casual Leave</option>
            <option>Loss of Pay Leave</option>
            <option>Compensatory Off Leave</option>
          </select>

          <label>Start Date</label>
          <input 
            type="date" 
            name="start_date" 
            value={formData.start_date}
            onChange={handleInputChange}
            required 
          />

          <label>Start Session</label>
          <select 
            name="start_session" 
            value={formData.start_session}
            onChange={handleInputChange}
            required
          >
            <option>Forenoon</option>
            <option>Afternoon</option>
          </select>

          <label>End Date</label>
          <input 
            type="date" 
            name="end_date" 
            value={formData.end_date}
            onChange={handleInputChange}
            required 
          />

          <label>End Session</label>
          <select 
            name="end_session" 
            value={formData.end_session}
            onChange={handleInputChange}
            required
          >
            <option>Forenoon</option>
            <option>Afternoon</option>
          </select>

          <label>Days</label>
          <input 
            type="number" 
            name="days" 
            min="1" 
            value={formData.days}
            onChange={handleInputChange}
            required 
          />

          <label>Reason</label>
          <textarea 
            name="reason" 
            placeholder="Enter reason for leave" 
            value={formData.reason}
            onChange={handleInputChange}
            required 
          />

          {session.role !== 'admin' && (
            session.role === 'staff' ? (
              <>
                <label>Select Substitute Staff (Optional)</label>
                <select 
                  name="substitute_user_id" 
                  value={formData.substitute_user_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- None --</option>
                  {allFaculty.map(staff => (
                    <option key={staff.user_id} value={staff.user_id}>
                      {staff.name} ({staff.department})
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label>Alternate Arrangements Made</label>
                <textarea 
                  name="alternate" 
                  placeholder="Mention alternate arrangements" 
                  value={formData.alternate}
                  onChange={handleInputChange}
                  required 
                />

                <label>Department for Substitute</label>
                <select 
                  name="department_select" 
                  value={formData.department_select}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <label>Substitute Faculty (Optional)</label>
                <select 
                  name="substitute_user_id" 
                  value={formData.substitute_user_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- None --</option>
                  {staff.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </>
            )
          )}

          <button type="submit">Submit Application</button>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;