import { Link } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";
import { useState } from "react";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setError("Please Enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter the password");
      return;
    }
    setError("");

    //Login API call
    try {
      const response = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });

      //Handle successful login response
      if (response.data) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again later");
      }
    }
  };
  return (
    <div className="h-screen bg-cyan-50 overflow-hidden relative">
      <div className="login-ui-box right-10 -top-40" />
      <div className="login-ui-box bg-cyan-200 -bottom-40 right-1/2" />
      <div className="container absolute flex h-screen items-center justify-center px-20 mx-auto">
        <div className="w-2/4 h-[80vh] bg-login-url flex items-end bg-cover bg-center rounded-lg p-10 z-5">
          <div>
            <h4 className="text-3xl text-white pr-7 mt-4">
              Capture your <br /> Journeys
            </h4>
            <p className="text-white mt-5">
              Record your travel experience and memories into your personal
              travel journey
            </p>
          </div>
        </div>
        <div className="w-2/4 h-[75vh] bg-white rounded-r-lg relative p-16 shadow-lg shadow-cyan-200/20">
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl font-semibold mb-7">Login</h4>
            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
            />
            <PasswordInput
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
            <button type="submit" className="btn-primary">
              LOGIN
            </button>

            <p className="text-xs text-slate-500  text-center my-4">Or</p>
            <Link to="/signUp">
              <button className="btn-primary btn-light">CREATE ACCOUNT</button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;
