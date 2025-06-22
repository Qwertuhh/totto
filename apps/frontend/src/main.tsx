import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CheckAuth from "@/components/checkAuth.tsx";
import TicketDetailsPage from "@/pages/ticketDetailsPage.tsx";
import Tickets from "@/pages/tickets.tsx";
import Login from "@/pages/login.tsx";
import SignUp from "@/pages/signUp.tsx";
import Admin from "@/pages/admin.tsx";
import Layout from "@/Layout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route
            path="/tickets"
            element={
              <CheckAuth protectedRoute={true}>
                {" "}
                <Tickets />
              </CheckAuth>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <CheckAuth protectedRoute={true}>
                {" "}
                <TicketDetailsPage />
              </CheckAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <CheckAuth protectedRoute={true}>
                {" "}
                <Admin />
              </CheckAuth>
            }
          />
          <Route
            path="/login"
            element={
              <CheckAuth protectedRoute={false}>
                {" "}
                <Login />
              </CheckAuth>
            }
          />
          <Route
            path="/signup"
            element={
              <CheckAuth protectedRoute={false}>
                {" "}
                <SignUp />
              </CheckAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
