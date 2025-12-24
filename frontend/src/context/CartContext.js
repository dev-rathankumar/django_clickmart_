import { createContext, useContext } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  return context;
};

export default CartContext;
