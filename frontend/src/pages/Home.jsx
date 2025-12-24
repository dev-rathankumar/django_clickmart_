import { useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAxios } from "../hooks/useAxios";
import Hero from "./Hero";
import Products from "./Products";

export const Home = () => {
  const { dispatch } = useCart();

  const { api } = useAxios();

  const fetchCartData = async () => {
    dispatch({ type: "START_LOADING" });
    try {
      const response = await api.get("/cart/");
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
  return (
    <>
      <Hero />
      <Products />
    </>
  );
};
