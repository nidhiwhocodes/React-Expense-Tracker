import { useContext } from "react";
import ExpenseContext from "./ExpenseContext";

const useExpenses = () => {
  return useContext(ExpenseContext);
};

export default useExpenses;