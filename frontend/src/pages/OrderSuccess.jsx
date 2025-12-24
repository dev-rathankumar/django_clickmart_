import { Link } from "react-router-dom";

const OrderSuccess = () => {
  return (
    <>
      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            {/* Success Icon */}
            <div className="mb-4 mt-5">
              <i
                className="bi bi-check-circle-fill text-success"
                style={{ fontSize: "5rem" }}
              ></i>
            </div>

            {/* Main Message */}
            <h1 className="display-5 fw-bold text-dark mb-3">
              Order Confirmed!
            </h1>
            <p className="lead text-muted mb-5">
              Thank you for your purchase. Your order has been successfully
              placed and is now being processed.
            </p>

            {/* Action Buttons */}
            <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
              <Link to="/" className="btn btn-primary btn-lg px-5 py-3">
                <i className="bi bi-bag me-2"></i>
                Continue Shopping
              </Link>
              <Link
                to="/dashboard/orders"
                className="btn btn-outline-dark btn-lg px-5 py-3"
              >
                <i className="bi bi-list-ul me-2"></i>
                View All Orders
              </Link>
            </div>

            <p className="text-muted mt-5 small">
              A confirmation email has been sent to your registered email
              address.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
