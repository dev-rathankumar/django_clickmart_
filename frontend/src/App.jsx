import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import { Home } from "./pages/Home";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import PrivateRoute from "./pages/PrivateRoute";
import ProductDetail from "./pages/ProductDetails";
import ProfileSettings from "./pages/ProfileSetting";
import Register from "./pages/Register";
import Header from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="orders" element={<Orders />} />
            </Route>
          </Route>
          <Route path="/order/success/:id" element={<OrderSuccess />} />
        </Routes>
        <Footer/>
      </Router>
    </>
  );
}

export default App;
