import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = () => {
  const { auth } = useAuth();

  return auth?.accessToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
