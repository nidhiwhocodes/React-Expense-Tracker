import { useReducer } from "react";
import AuthContext from "./AuthContext";

const initialState = {
  isLoggedIn: false,
  token: null,
  userId: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        isLoggedIn: true,
        token: action.payload.token,
        userId: action.payload.userId,
      };

    case "LOGOUT":
      return {
        isLoggedIn: false,
        token: null,
        userId: null,
      };

    default:
      return state;
  }
};

function AuthProvider({ children }) {
  const [authState, dispatch] = useReducer(
    authReducer,
    initialState
  );

  return (
    <AuthContext.Provider
      value={{
        authState,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;