import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GymSetup from "./pages/GymSetup";
import AdminDashboard from "./pages/AdminDashboard";
import AllMembers from "./pages/AllMembers";
import Subscriptions from "./pages/Subscriptions";
import Pricing from "./pages/Pricing";

export const router = createBrowserRouter([
  // ✅ Make / go to /login (clean URLs)
  { path: "/", element: <Navigate to="/login" replace /> },

  // ✅ Real auth routes
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },

  // ✅ App routes
  { path: "/gym-setup", element: <GymSetup /> },
  { path: "/admin", element: <AdminDashboard /> },
  { path: "/members", element: <AllMembers /> },
  { path: "/subscriptions", element: <Subscriptions /> },
  { path: "/pricing", element: <Pricing /> },

  // ✅ Catch-all
  { path: "*", element: <Navigate to="/login" replace /> },
]);