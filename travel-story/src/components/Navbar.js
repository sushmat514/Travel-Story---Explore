import { useNavigate } from "react-router-dom";
import loginLogo from "../assets/Logo.png";
import ProfileInfo from "./ProfileInfo";

import SearchBar from "./SearchBar";

const Navbar = ({
  userInfo,
  searchQuery,
  setSearchQuery,
  onSearchNote,
  handleClearSearch,
}) => {
  const isToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };
  const onClearSearch = () => {
    handleClearSearch();
    setSearchQuery("");
  };
  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <div className="bg-white flex  items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
      <img src={loginLogo} alt="login" className="h-14" />

      {isToken && (
        <>
          <SearchBar
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
            }}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
          <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
        </>
      )}
    </div>
  );
};
export default Navbar;
