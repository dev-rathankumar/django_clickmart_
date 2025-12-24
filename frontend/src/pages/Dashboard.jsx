import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  return (
    <>
      <div className=" min-vh-100">
        <div className="container my-5">
          <div className="row">
            <Sidebar />

            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
