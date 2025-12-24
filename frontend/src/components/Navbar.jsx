import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import useAuth from "../hooks/useAuth";
import { useAxios } from "../hooks/useAxios";

const Header = () => {
  const [profile, setProfile] = useState(null);
  const { state } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const accessToken = auth?.accessToken;
  const { api } = useAxios();
  const { dispatch } = useCart();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile/");
        setProfile(response?.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    if (accessToken) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [accessToken, api]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setAuth({});
    setProfile(null);
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
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-bag-heart-fill text-primary me-2"></i>
          ClickMart
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  isActive("/") ? "text-primary fw-semibold" : ""
                }`}
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item position-relative">
              <Link
                className={`nav-link mx-2 ${
                  isActive("/cart") ? "text-primary fw-semibold" : ""
                }`}
                to="/cart"
              >
                <i className="bi bi-cart3"></i> Cart
                {state?.itemCount > 0 && (
                  <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                    {state?.itemCount}
                  </span>
                )}
              </Link>
            </li>
            {!accessToken ? (
              <li className="nav-item d-flex gap-2 ms-3">
                <Link className="btn btn-outline-primary btn-sm" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary btn-sm" to="/signup">
                  Sign Up
                </Link>
              </li>
            ) : (
              <li className="nav-item dropdown ms-3">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <User size={18} className="me-1" />
                  {profile?.username}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  {/* <li>
                    <Link className="dropdown-item" to="/profile">
                      Profile Settings
                    </Link>
                  </li> */}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <LogOut size={16} className="me-2" />
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
