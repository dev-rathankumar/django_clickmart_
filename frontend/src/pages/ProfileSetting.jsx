import { Save, User } from "lucide-react";
import { useState } from "react";

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const user = "";
  const isLoading = false;
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [alerts, setAlerts] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      const success = " ";
      if (success) {
        setAlerts({
          type: "success",
          message: "Profile updated successfully!",
        });
        setTimeout(() => setAlerts(null), 3000);
      }
    } catch (error) {
      setAlerts({
        type: "danger",
        message: "Failed to update profile",
      });
    }
  };

  return (
    <div className="col-lg-9 mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="mb-4">
            <h2 className="mb-1">Profile Settings</h2>
            <p className="text-muted">
              Manage your account information
            </p>
          </div>

          {/* Alerts */}
          {alerts && (
            <div
              className={`alert alert-${alerts.type} alert-dismissible fade show`}
              role="alert"
            >
              {alerts.message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setAlerts(null)}
              ></button>
            </div>
          )}

          {/* Card */}
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs" role="tablist">
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "profile" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User size={18} className="me-2" />
                    Profile Information
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h5 className="mb-3">Personal Information</h5>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="me-2" />
                          Update Profile
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
