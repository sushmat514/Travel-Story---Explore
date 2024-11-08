import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axiosInstance from "../utils/axiosInstance";
import TravelStoryCard from "../components/TravelStoryCard";
import { ToastContainer, toast } from "react-toastify";
import { MdAdd } from "react-icons/md";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import AddEditTravelStory from "../components/AddEditTravelStory";
import ViewTravelStoryModal from "../components/ViewTravelStoryModal";
import EmptyCard from "../components/EmptyCard";
import { DayPicker } from "react-day-picker";
import moment from "moment";
import FilterInfoTitle from "../components/FilterInfoTitle";
import { getEmptyCardMessage } from "../utils/helper";

const Home = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allStories, setAllStories] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [openAddEditModal, setOpenAddEditModel] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });
  const getUserInfo = async () => {
    const response = await axiosInstance.get("/get-user");
    if (response.data && response.data.user) {
      setUserInfo(response.data.user);
    }
  };
  //get all travel Stories
  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get("/all-travel-stories");
      setAllStories(response?.data?.stories);
    } catch (error) {
      console.log(error);
    }
  };

  //Delete travel story
  const deleteTravelStory = async (data) => {
    const storyId = data._id;
    try {
      const response = await axiosInstance.delete(
        `/delete-travel-story/${storyId}`
      );
      if (response.data && !response.data.error) {
        toast.error("Story Deleted Successfully");
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
        getAllTravelStories();
      }
    } catch (error) {
      console.log("Unexpected error occurred.Please try again later");
    }
  };
  //handle edit story click
  const handleEdit = (data) => {
    setOpenAddEditModel({ isShown: true, type: "edit", data: data });
  };
  //handle travel story click
  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  };

  //search Story
  const onSearchStory = async (query) => {
    try {
      const response = await axiosInstance.get("/search", {
        params: {
          query,
        },
      });

      if (response.data && response.data.stories) {
        setFilterType("search");
        setAllStories(response?.data?.stories);
      }
    } catch (error) {
      console.log("Unexpected error occurred. Please try again later");
    }
  };
  const handleClearSearch = () => {
    setFilterType("");
    getAllTravelStories();
  };
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData?._id;
    try {
      const response = await axiosInstance.put(
        "/update-isFavourite/" + storyId,
        { isFavourite: !storyData.isFavourite }
      );
      if (response.data && response.data.travelStory) {
        toast.success("Story updated successfully");
        if (filterType === "search" && searchQuery) {
          onSearchStory(searchQuery);
        } else if (filterType === "date") {
          filterStoriesByDate(dateRange);
        } else {
          getAllTravelStories();
        }
      }
    } catch (error) {
      console.log("Unexpected error occured. Please try again.");
    }
  };

  //Handle filter story by Date Range
  const filterStoriesByDate = async (day) => {
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null;
      const endDate = day.to ? moment(day.to).valueOf() : null;
      if (startDate && endDate) {
        const response = await axiosInstance.get("/travel-stories/filter", {
          params: { startDate, endDate },
        });

        if (response.data && response.data.filterStories) {
          setFilterType("date");
          setAllStories(response?.data?.filterStories);
        }
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const handleDayClick = (day) => {
    setDateRange(day);
    filterStoriesByDate(day);
  };
  const resetFilter = () => {
    setDateRange({ from: null, to: null });
    setFilterType("");
    getAllTravelStories();
  };
  useEffect(() => {
    getUserInfo();
    getAllTravelStories();
    return () => {};
  }, []);
  return (
    <div>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchNote={onSearchStory}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto py-10">
        <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => {
            resetFilter();
          }}
        />

        <div className="flex gap-7">
          <div className="flex-1">
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {allStories.map((items) => {
                  return (
                    <TravelStoryCard
                      items={items}
                      key={items._id}
                      imageUrl={items.imageUrl}
                      date={items.visitedDate}
                      title={items.title}
                      story={items.story}
                      visitedLocation={items.visitedLocation}
                      isFavourite={items.isFavourite}
                      onEdit={() => {
                        handleEdit(items);
                      }}
                      onClick={() => handleViewStory(items)}
                      onFavouriteClick={() => updateIsFavourite(items)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyCard message={getEmptyCardMessage(filterType)} />
            )}
          </div>
          <div className="w-[340px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/50 rounded-lg">
              <div className="px-3">
                <DayPicker
                  captionLayout="dropdown-buttons"
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pageNavigation
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/** Add & Edit Travel Story Model */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgb(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <AddEditTravelStory
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() =>
            setOpenAddEditModel({ isShown: false, type: "add", data: null })
          }
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>
      {/* View story */}
      <ViewTravelStoryModal
        openViewModal={openViewModal}
        setOpenViewModal={() =>
          setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
        }
        onEditClick={(data) => handleEdit(data)}
        onDeleteStory={(data) => deleteTravelStory(data)}
      />
      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModel({ ...openAddEditModal, isShown: true });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
      <ToastContainer />
    </div>
  );
};
export default Home;
