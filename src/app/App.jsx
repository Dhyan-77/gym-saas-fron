import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  useEffect(() => {
  const token = localStorage.getItem("access");
  if (token) {
    // optionally verify token or fetch user
  }
}, []);
  return <RouterProvider router={router} />;
}
