import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import FeedbackListWithReply from "./FeedbackListWithReply";
import "./StaffPage.css";

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/v1/staffs/list"
        );
        setStaff(response.data);
      } catch (error) {
        console.error("Error fetching staff", error);
      }
    };
    fetchStaff();
  }, []);

  const handleStatusChange = async (staffId, newStatus) => {
    try {
      await axios.put(`http://localhost:8081/api/v1/staffs/update`, {
        staff_id: staffId,
        staff_status: newStatus,
      });
      setStaff(
        staff.map((member) =>
          member.staff_id === staffId
            ? { ...member, staff_status: newStatus }
            : member
        )
      );
    } catch (error) {
      console.error("Error updating staff status", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/v1/staffs/search-new",
        {
          params: { keyword: searchQuery },
        }
      );
      setStaff(response.data);
    } catch (error) {
      console.error("Error searching staff", error);
    }
  };

  const handleOpenFeedbackModal = () => {
    setIsFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
  };

  const handleOpenDoctorsPage = () => {
    navigate("/doctors");
  };

  const handleOpenPatientsPage = () => {
    navigate("/patients");
  };

  const handleOpenAppointmentsPage = () => {
    navigate("/appointments");
  };

  const handleOpenStaffPage = () => {
    navigate("/staff");
  };

  return (
    <div className="staff-page">
      <Sidebar
        onInboxClick={handleOpenFeedbackModal}
        handleOpenDoctorsPage={handleOpenDoctorsPage}
        handleOpenPatientsPage={handleOpenPatientsPage}
        handleOpenAppointmentsPage={handleOpenAppointmentsPage}
        handleOpenStaffPage={handleOpenStaffPage}
      />
      <div className="content">
        <div className="header">
          <h2>Staffs List</h2>
          <div className="search">
            <div className="input-container">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <label>Name or Email</label>
            </div>
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>
        <div className="table-container-1">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Working Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? (
                staff.map((staffMember, index) => (
                  <tr key={staffMember.staff_id}>
                    <td>{staffMember.staff_id}</td>
                    <td>{staffMember.staff_name}</td>
                    <td>{staffMember.staff_email}</td>
                    <td>{staffMember.staff_phone}</td>
                    <td>{staffMember.staff_address}</td>
                    <td>
                      <select
                        value={staffMember.staff_status}
                        onChange={(e) =>
                          handleStatusChange(
                            staffMember.staff_id,
                            e.target.value
                          )
                        }
                        className="staff-select"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} align="center">
                    No staff found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isFeedbackModalOpen && (
          <div className="feedback-modal">
            <FeedbackListWithReply onClose={handleCloseFeedbackModal} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPage;