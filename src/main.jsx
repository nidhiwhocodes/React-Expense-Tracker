import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App";
import "./index.css";
import store from "./redux/store";

import AuthProvider from "./context/AuthProvider";
import ExpenseProvider from "./context/ExpenseProvider";
import ThemeProvider from "./context/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
     <Provider store={store}>
    <BrowserRouter>
      <AuthProvider>
        <ExpenseProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ExpenseProvider>
      </AuthProvider>
    </BrowserRouter>
    </Provider>
  </React.StrictMode>
);