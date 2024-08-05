import React, { useState } from "react";
import "./ImageGallery.css";
import ImageDetailsPopup from "./ImageDetailsPopup";
import { FaTrash } from "react-icons/fa";
import { useAuth } from "./AuthProvider";
import { backendBaseUrl } from "../config";

const ImageGallery = ({ images, fetchImages, onDeleteImage }) => {
  const [showImageDetailsPopup, setShowImageDetailsPopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { getUser } = useAuth();
  const user = getUser();
  const isAdmin = user && user.role.toUpperCase() === "ADMIN";

  const handleImageCardClick = (imageId, imageData, imageDescription, uploadedBy, uploadDate) => {
    setSelectedImage({ imageId, imageData, imageDescription, uploadedBy, uploadDate });
    setShowImageDetailsPopup(true);
  };

  const handleDeleteImage = async (imageId) => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      const response = await fetch(`${backendBaseUrl}/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!response.ok) throw new Error("Failed to delete image");
      onDeleteImage();
      fetchImages(); // Refresh images after deletion
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleDescriptionUpdate = () => {
    fetchImages(); // Refresh images after description update
  };

  return (
    <div className="image-gallery">
      {images.map((image) => (
        <div
          key={image.imageId}
          className="image-card"
          onClick={() => handleImageCardClick(
            image.imageId,
            image.imageData,
            image.description,
            image.uploadedBy,
            image.uploadDate
          )}
        >
          <div className="image-wrapper">
            <img
              src={`data:image/png;base64,${image.imageData}`}
              alt={image.imageName}
            />
            {isAdmin && (
              <div
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(image.imageId);
                }}
              >
                <FaTrash />
              </div>
            )}
          </div>
          <div className="image-details">
            <p>Upload Date: {new Date(image.uploadDate).toLocaleDateString()}</p>
            <div
              className="description"
              dangerouslySetInnerHTML={{ __html: image.description.replace(/\n/g, "<br />") }}
            />
          </div>
        </div>
      ))}
      {showImageDetailsPopup && selectedImage && (
        <ImageDetailsPopup
          imageId={selectedImage.imageId}
          imageData={selectedImage.imageData}
          imageDescription={selectedImage.imageDescription}
          uploadedBy={selectedImage.uploadedBy}
          uploadDate={selectedImage.uploadDate}
          onClose={() => setShowImageDetailsPopup(false)}
          onDescriptionUpdate={handleDescriptionUpdate}
        />
      )}
    </div>
  );
};

export default ImageGallery;
