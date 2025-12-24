import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Package,
} from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useAxios } from "../hooks/useAxios";
import OrderDetail from "../components/OrderDetail";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (orderId) => {
  setSelectedOrder(orderId);
  setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };
  

  const { api } = useAxios();
  const { auth } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/orders/"); // Get all orders list
        setOrders(response.data.reverse());
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    if (auth.accessToken) fetchOrders();
  }, [api, auth.accessToken]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "#FFF9DB",
          text: "#8C6D05",
          border: "#FFEC99",
          icon: <Clock size={14} />,
          accent: "#FAB005",
        };
      case "CONFIRMED":
        return {
          bg: "#E7F5FF",
          text: "#1864AB",
          border: "#A5D8FF",
          icon: <CheckCircle size={14} />,
          accent: "#228BE6",
        };
      case "DELIVERED":
        return {
          bg: "#EBFBEE",
          text: "#2B8A3E",
          border: "#B2F2BB",
          icon: <Package size={14} />,
          accent: "#40C057",
        };
      default:
        return {
          bg: "#F8F9FA",
          text: "#495057",
          border: "#DEE2E6",
          icon: <AlertCircle size={14} />,
          accent: "#ADB5BD",
        };
    }
  };

  return (
    <div className="col-lg-9 py-4 px-md-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1 text-dark">Purchase History</h2>
        <p className="text-muted">
          A detailed list of all your previous orders.
        </p>
      </div>

      <div className="d-grid gap-3">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => {
            const config = getStatusConfig(order.status);
            return (
              <div
                key={order.id}
                className="card border-0 shadow-sm transition-hover"
                style={{
                  borderLeft: `6px solid ${config.accent}`,
                  borderRadius: "12px",
                }}
              >
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <h6 className="text-primary fw-bold mb-1">
                        #{order.id}
                      </h6>
                      <span className="text-muted small">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </span>
                    </div>

                    <div className="col-md-4 py-3 py-md-0">
                      <div className="d-flex align-items-center gap-4">
                        <div>
                          <small className="text-muted d-block">
                            Total Amount
                          </small>
                          <span className="fw-bold fs-5">
                            ${order.grand_total}
                          </span>
                        </div>
                        <div className="text-muted small">
                          <small className="d-block">Tax</small>
                          <span>${order.tax_amount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-2 mb-3 mb-md-0">
                      <span
                        className="badge d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                        style={{
                          backgroundColor: config.bg,
                          color: config.text,
                          border: `1px solid ${config.border}`,
                          fontWeight: "600",
                        }}
                      >
                        {config.icon} {order.status}
                      </span>
                    </div>

                    <div className="col-md-3">
                      <div className="d-flex gap-2 justify-content-md-end">
                        <button className="btn btn-primary roidunded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm" onClick={() => handleOpenModal(order?.id)}>
                          <Eye size={16} /> Details
                        </button>
                       
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-5 border rounded-4 bg-white">
            <Package size={40} className="text-muted mb-2 opacity-25" />
            <p className="text-muted mb-0">No orders found in your account.</p>
          </div>
        )}
      </div>
      <OrderDetail 
        orderId={selectedOrder} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default Orders;
