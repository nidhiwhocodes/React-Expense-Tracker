import { useDispatch } from "react-redux";
import { toggleCart } from "../redux/cartSlice";

function Navbar() {
  const dispatch = useDispatch();

  const cartHandler = () => {
    dispatch(toggleCart());
  };

  return (
    <nav>
      <button onClick={cartHandler}>
        My Cart
      </button>
    </nav>
  );
}

export default Navbar;