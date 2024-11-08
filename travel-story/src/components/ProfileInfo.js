import { useNavigate } from "react-router-dom";
import { getIntials } from "../utils/helper";
const ProfileInfo = ({ userInfo }) => {
  const navigate = useNavigate();
  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
        {getIntials(userInfo ? userInfo.fullName : "")}
      </div>
      <div>
        <p>{userInfo?.fullName || ""}</p>
        <button className="" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};
export default ProfileInfo;
