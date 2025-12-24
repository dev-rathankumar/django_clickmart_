import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useAxios } from "../hooks/useAxios";

const DashboardHome = () => {
  const [profile, setProfile] = useState(null);
  const [ordeers, setOrdeers] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { auth } = useAuth();
  const accessToken = auth?.accessToken;
  const { api } = useAxios();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsInitialLoading(true);

        const [profileRes, ordersRes] = await Promise.all([
          api.get("/profile/"), // Show username and email in dashboard
          api.get("/orders/"),
        ]);

        setProfile(profileRes.data);
        setOrdeers(ordersRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (accessToken) {
      fetchDashboardData();
    } else {
      setIsInitialLoading(false);
    }
  }, [accessToken, api]);

  const getStatusSettings = (status) => {
    switch (status) {
      case "PENDING":
        return { color: "warning", textClass: "text-dark" };
      case "CONFIRMED":
        return { color: "info", textClass: "text-dark" };
      case "DELIVERED":
        return { color: "success", textClass: "text-success" };
      default:
        return { color: "secondary", textClass: "text-secondary" };
    }
  };

  if (isInitialLoading) {
    return (
      <div
        className="col-lg-9 d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p className="text-muted small">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="col-lg-9">
        <header className="mb-4">
          <h2 className="fw-bold">
            Welcome back, {profile?.username || "User"}!
          </h2>
          <p className="text-muted">
            Manage your account and track your recent orders.
          </p>
        </header>

        {/* Profile Detail Card */}
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3 border-bottom-0">
            <h5 className="mb-0 fw-bold">Profile Details</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="text-muted small d-block">Username</label>
                <span className="fw-semibold">{profile?.username}</span>
              </div>
              <div className="col-sm-6">
                <label className="text-muted small d-block">
                  Email Address
                </label>
                <span className="fw-semibold">{profile?.email}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Orders Table */}
        <section className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom-0">
            <h5 className="mb-0 fw-bold">Recent Orders</h5>
            <button className="btn btn-link text-decoration-none btn-sm">
              View All
            </button>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Order ID</th>
                  <th>Date</th>
                  <th>Subtotal</th>
                  <th>Total (Inc. Tax)</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {ordeers.length > 0 ? (
                  ordeers.slice(0, 4).map((order) => {
                    const { color, textClass } = getStatusSettings(
                      order.status
                    );
                    return (
                      <tr key={order.id}>
                        <td className="ps-4 text-primary fw-medium">
                          #{order.id}
                        </td>
                        <td>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td>${order.subtotal}</td>
                        <td className="fw-bold">${order.grand_total}</td>
                        <td>
                          <span
                            className={`badge bg-${color}-subtle ${textClass} border border-${color}-subtle px-3 py-2 rounded-pill`}
                            style={{ fontSize: "0.75rem" }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button className="btn btn-sm btn-light border">
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
};

export default DashboardHome;
