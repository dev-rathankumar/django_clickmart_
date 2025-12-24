import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import QuantitySelector from "../components/QuantitySelector";
import { useCart } from "../context/CartContext";
import { useAxios } from "../hooks/useAxios";

const Cart = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const { api } = useAxios();

  const fetchCartData = async () => {
    dispatch({ type: "START_LOADING" });
    try {
      const response = await api.get("/cart/");
      console.log("cart response", response.data);
      dispatch({
        type: "SET_CART",
        payload: {
          items: response.data.items,
          subtotal: response.data.subtotal || 0,
          total: parseFloat(response.data.grand_total) || 0,
          itemCount: response?.data?.items?.length || 0,
        },
      });
    } catch (err) {
      console.error("Fetch error", err);
      dispatch({ type: "STOP_LOADING" });
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleQuantityChange = async (itemId, currentQty, newQty) => {
    const change = newQty - currentQty;
    if (change === 0) return;

    try {
      await api.patch(`/cart/items/${itemId}/`, { change });

      fetchCartData();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    if (window.confirm(`Remove ${itemName} from cart?`)) {
      try {
        await api.delete(`/cart/items/${itemId}/`);
        fetchCartData();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  // Empty State UI
  if (!state.loading && state.items.length === 0) {
    return (
      <>
        <div className="container py-5" style={{ minHeight: "80vh" }}>
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="alert alert-info p-5">
                <i className="bi bi-cart-x display-1 text-muted mb-3 d-block"></i>
                <h3>Your Cart is Empty</h3>
                <p className="lead text-muted mb-4">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link to="/" className="btn btn-primary btn-lg">
                  <i className="bi bi-bag-plus me-2"></i>
                  Start Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <h1 className="display-6 fw-bold mb-4">Shopping Cart</h1>

        <div className="row g-4">
          {/* Items List */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm overflow-hidden">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Items ({state?.itemCount})</h5>
              </div>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th>Tax Percent</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state?.items?.map((item) => (
                      <tr key={item?.id}>
                        <td className="ps-4 py-3">
                          <div className="fw-medium text-dark">
                            {item?.product_name}
                          </div>
                        </td>
                        <td>${parseFloat(item?.price)}</td>
                        <td>
                          <QuantitySelector
                            quantity={item.quantity}
                            onQuantityChange={(newQty) =>
                              handleQuantityChange(
                                item.id,
                                item.quantity,
                                newQty
                              )
                            }
                            min={0}
                            max={item?.stock || 99}
                            size="sm"
                          />
                        </td>
                        <td className="fw-medium">
                          ${parseFloat(item?.price) * item?.quantity}
                        </td>
                        <td className="fw-medium">
                          {item.tax_percent}%
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-link text-danger p-0"
                            onClick={() =>
                              handleRemoveItem(item?.id, item?.product_name)
                            }
                          >
                            <i className="bi bi-trash3 fs-5"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Link to="/" className="btn btn-link mt-3 text-decoration-none">
              <i className="bi bi-arrow-left me-2"></i> Continue Shopping
            </Link>
          </div>

          {/* Summary Sidebar */}
          <div className="col-lg-4">
            <div
              className="card border-0 shadow-sm p-4 sticky-top"
              style={{ top: "100px" }}
            >
              <h4 className="fw-bold mb-4">Order Summary</h4>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>${state?.subtotal}</span>
              </div>

              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax</span>
                <span>${state?.total - state?.subtotal}</span>
              </div>

              <hr className="my-3" />

              <div className="d-flex justify-content-between mb-4">
                <span className="h5 fw-bold">Total</span>
                <span className="h5 fw-bold text-primary">${state?.total}</span>
              </div>

              <button
                className="btn btn-primary btn-lg w-100 py-3 mb-3 fw-bold"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <div className="text-center">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  Secure Checkout
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
