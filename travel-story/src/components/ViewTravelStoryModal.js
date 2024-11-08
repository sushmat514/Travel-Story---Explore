import Modal from "react-modal";
import ViewTravelStory from "./ViewTravelStory";
const ViewTravelStoryModal = ({
  openViewModal,
  setOpenViewModal,
  onEditClick,
  onDeleteStory,
}) => {
  return (
    <Modal
      isOpen={openViewModal.isShown}
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
      <ViewTravelStory
        storyInfo={openViewModal.data}
        onEditClick={() => {
          setOpenViewModal();
          onEditClick(openViewModal.data);
        }}
        onDeleteClick={() => {
          onDeleteStory(openViewModal.data);
        }}
        onClose={setOpenViewModal}
      />
    </Modal>
  );
};
export default ViewTravelStoryModal;
