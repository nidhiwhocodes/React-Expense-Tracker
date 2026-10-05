import { useReducer } from "react";
import ExpenseContext from "./ExpenseContext";

const initialState = [];

const expenseReducer = (state, action) => {
  switch (action.type) {
    case "ADD_EXPENSE":
      return [action.payload, ...state];

    case "SET_EXPENSES":
      return action.payload;

    case "CLEAR_EXPENSES":
      return [];

    default:
      return state;
  }
};

function ExpenseProvider({ children }) {
  const [expenses, dispatch] = useReducer(
    expenseReducer,
    initialState
  );

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        dispatch,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export default ExpenseProvider;