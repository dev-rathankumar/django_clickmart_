import { LayoutDashboard, LogOut, Package } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import useAuth from "../hooks/useAuth";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { auth, setAuth } = useAuth();
  const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dashboard/orders", icon: Package, label: "My Orders" },
    // { path: "/dashboard/profile", icon: User, label: "Profile Info" },
    // { path: "/dashboard/addresses", icon: MapPin, label: "Addresses" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setAuth({});
    dispatch({
      type: "SET_CART",
      payload: {
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
      },
    });

    navigate("/");
  };

  return (
    <aside className="col-lg-3 mb-4">
      <div className="card border-0 shadow-sm p-3">
        <nav className="nav flex-column gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `nav-link rounded d-flex align-items-center ${
                  isActive ? "bg-primary text-white shadow-sm" : "text-dark"
                }`
              }
              style={{ cursor: "pointer", transition: "0.2s" }}
            >
              <item.icon size={18} className="me-2" /> {item.label}
            </NavLink>
          ))}

          <hr />

          <button
            className="nav-link text-danger border-0 bg-transparent d-flex align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => handleLogout()}
          >
            <LogOut size={18} className="me-2" /> Logout
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
