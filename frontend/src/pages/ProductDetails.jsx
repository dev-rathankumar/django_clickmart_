import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import QuantitySelector from "../components/QuantitySelector";
import { useCart } from "../context/CartContext";
import useAuth from "../hooks/useAuth";
import { useAxios } from "../hooks/useAxios";

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { api: axiosapi } = useAxios();
  const { state, dispatch } = useCart();

  const { auth } = useAuth();
  const accessToken = auth?.accessToken;

  const cartItem = state.items.find((item) => item.product === product?.id);
  const isInCart = !!cartItem;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}/`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching product details:", err);
        if (err.response && err.response.status === 404) {
          setError("Product Not Found");
        } else {
          setError("Failed to load product details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, api]);

  const fetchCartData = async () => {
    dispatch({ type: "START_LOADING" });
    try {
      const response = await axiosapi.get("/cart/");
      const items =
        response.data.items ||
        (Array.isArray(response.data) ? response.data : []);

      dispatch({
        type: "SET_CART",
        payload: {
          items: items,
          subtotal: response.data.subtotal || 0,
          total: response.data.grand_total || 0,
          itemCount: items?.length,
        },
      });
    } catch (err) {
      dispatch({ type: "STOP_LOADING" });
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleUpdateQuantity = async (itemId, change) => {
    try {
      await axiosapi.patch(`/cart/items/${itemId}/`, { change });
      fetchCartData();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleAddToCart = async () => {
    if (!accessToken) return navigate("/login");
    try {
      const response = await axiosapi.post("/cart/add/", {
        product_id: product.id,
        quantity: 1,
      });

      dispatch({
        type: "SET_CART",
        payload: {
          items: response.data.items,
          subtotal: response.data.subtotal || 0,
          total: response.data.grand_total || 0,
          itemCount: response?.data?.items?.length,
        },
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to add to cart.";
    }
  };

  if (loading) {
    return (
      <>
        <div
          className="container py-5 text-center"
          style={{ minHeight: "50vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            <h4 className="alert-heading">{error || "Product Not Found"}</h4>
            <p>
              The product you're looking for doesn't exist or could not be
              loaded.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to Products
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="py-5 vh-100">
        <div className="container">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button
                  className="btn btn-link p-0"
                  onClick={() => navigate("/")}
                >
                  Home
                </button>
              </li>
              <li className="breadcrumb-item">
                <button
                  className="btn btn-link p-0"
                  onClick={() => navigate("/#products")}
                >
                  Products
                </button>
              </li>
              <li className="breadcrumb-item active">{product?.name}</li>
            </ol>
          </nav>

          <div className="row mb-5">
            <div className="col-lg-6 mb-4">
              <img
                src={product?.image}
                alt={product?.name}
                className="img-fluid w-100 rounded shadow-sm"
              />
            </div>

            <div className="col-lg-6">
              <h1 className="display-6 fw-bold mb-3">{product?.name}</h1>

              <div className="mb-3">
                <span className="h2 text-primary fw-bold">
                  ${product?.price}
                </span>
                <span className="ms-3 text-muted">
                  {product?.stock > 0 ? (
                    <>
                      <i className="bi bi-check-circle-fill text-success me-1"></i>
                      {product?.stock} in stock
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle-fill text-danger me-1"></i>
                      Out of stock
                    </>
                  )}
                </span>
              </div>

              <p className="lead mb-4">{product?.description}</p>

              {/* Conditional Quantity Section */}
              <div className="mb-4">
                {isInCart ? (
                  <>
                    <h6 className="mb-3">Quantity in Cart:</h6>
                    <QuantitySelector
                      quantity={cartItem?.quantity}
                      onQuantityChange={(newQty) => {
                        const diff = newQty - cartItem?.quantity;
                        handleUpdateQuantity(cartItem?.id, diff);
                      }}
                      max={product?.stock}
                    />
                  </>
                ) : (
                  <p className="text-muted small">Not in your cart yet.</p>
                )}
              </div>

              {/* Conditional Action Buttons */}
              <div className="d-flex gap-3">
                {isInCart ? (
                  <button
                    className="btn btn-success btn-lg flex-fill"
                    onClick={() => navigate("/cart")}
                  >
                    <i className="bi bi-cart-check me-2"></i>
                    Go to Cart
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-lg flex-fill"
                    onClick={handleAddToCart}
                    disabled={product?.stock === 0}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Add to Cart
                  </button>
                )}
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => navigate("/cart")}
                >
                  <i className="bi bi-eye"></i>
                </button>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <div className="row text-center">
                  <div className="col">
                    <i className="bi bi-shield-check text-success h4 mb-2 d-block"></i>
                    <small>Secure Payment</small>
                  </div>
                  <div className="col">
                    <i className="bi bi-truck text-primary h4 mb-2 d-block"></i>
                    <small>Fast Delivery</small>
                  </div>
                  <div className="col">
                    <i className="bi bi-arrow-clockwise text-info h4 mb-2 d-block"></i>
                    <small>Easy Returns</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
