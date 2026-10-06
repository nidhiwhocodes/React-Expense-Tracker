import { useReducer } from "react";
import ThemeContext from "./ThemeContext";

const initialState = {
  isDark: false,
  isPremium: false,
};

const themeReducer = (state, action) => {
  switch (action.type) {
    case "ACTIVATE_PREMIUM":
      return {
        ...state,
        isPremium: true,
      };

    case "TOGGLE_THEME":
      return {
        ...state,
        isDark: !state.isDark,
      };

    default:
      return state;
  }
};

function ThemeProvider({ children }) {
  const [themeState, dispatch] = useReducer(
    themeReducer,
    initialState
  );

  return (
    <ThemeContext.Provider
      value={{
        themeState,
        dispatch,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;