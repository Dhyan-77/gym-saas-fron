import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GymSetup from "./pages/GymSetup";
import AdminDashboard from "./pages/AdminDashboard";
import AllMembers from "./pages/AllMembers";
import Subscriptions from "./pages/Subscriptions";
import Pricing from "./pages/Pricing";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/gym-setup",
    Component: GymSetup,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/members",
    Component: AllMembers,
  },
  {
    path: "/subscriptions",
    Component: Subscriptions,
  },
  {
    path: "/pricing",
    Component: Pricing,
  },
]);
