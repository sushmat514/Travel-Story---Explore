import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";
const App = () => {
  return (
    <div className="App">
      <Root />
      <Outlet />
    </div>
  );
};
const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  );
};
export default App;
