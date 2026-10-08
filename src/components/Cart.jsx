import { useSelector } from "react-redux";

function Cart() {
  const isCartVisible = useSelector(
    (state) => state.cart.isCartVisible
  );

  if (!isCartVisible) {
    return null;
  }

  return (
    <div>
      <h2>My Cart</h2>

      <p>Your cart is visible.</p>
    </div>
  );
}

export default Cart;