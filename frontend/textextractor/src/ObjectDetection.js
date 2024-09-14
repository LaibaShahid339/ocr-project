import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import './FrontScreen.css';
import { useNavigate} from "react-router-dom";

const ObjectDetection = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal for displaying detected image
  const [cameraModalIsOpen, setCameraModalIsOpen] = useState(false); // Modal for camera access
  const [image, setImage] = useState(null); // State for storing captured image
  const fileInputRef = useRef(null);
  const navigator = useNavigate();
  const handleShareScreen = () =>{
    navigator('/ScreenObject')
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      await uploadAndDetect(file);
    }
  };

  // Upload image and handle detection
  const uploadAndDetect = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/object-detection", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob", // Important for receiving image blob
      });

      // Create a URL for the image blob
      const imageBlob = response.data;
      const imageObjectUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageObjectUrl);
      setIsModalOpen(true); // Open the modal when image is ready
    } catch (error) {
      console.error("Error during object detection:", error);
      alert("An error occurred while processing the image.");
    }
  };

  // Handle image capture from the camera
  const handleSavePhoto = async (imageSrc) => {
    // Convert Base64 to Blob
    const base64Response = await fetch(imageSrc);
    const blob = await base64Response.blob();
    const file = new File([blob], "captured_image.jpg", { type: 'image/jpeg' });

    setImage(file);
    setCameraModalIsOpen(false); // Close camera modal
    await uploadAndDetect(file); // Trigger detection with the captured image
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setImageUrl(""); // Clear image URL when closing
  };

  // Open camera modal
  const handleCameraClick = () => {
    setCameraModalIsOpen(true);
  };

  // Close camera modal
  const closeCameraModal = () => {
    setCameraModalIsOpen(false);
  };

  return (
    <div className='abc'>
      <h1>Object Detection</h1>
      <div className='but'>
        <button onClick={handleCameraClick}>Access Camera</button>
        <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          style={{ display: 'none' }}  // Hide the file input
          onChange={handleFileChange}
        />
        <button onClick={handleButtonClick}>Upload and Detect</button>
        <button onClick={handleShareScreen}>
          Share Screen
        </button>
      </div>

      {/* Camera Modal */}
      {cameraModalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeCameraModal}>&times;</span>
            <h2>Capture Image</h2>
            <Webcam
              audio={false}
              screenshotFormat="image/jpeg"
              className="webcam"
              videoConstraints={{ facingMode: "user" }}
              onUserMediaError={() => alert("Camera not accessible")}
            >
              {({ getScreenshot }) => (
                <div>
                <button
                  className="capture-button"
                  onClick={() => {
                    const screenshot = getScreenshot();
                    handleSavePhoto(screenshot);
                  }}
                >
                  Capture
                </button>
                                  
                </div>
              )}
            </Webcam>
          </div>
        </div>
      )}

      {/* Modal for displaying the detected image */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Detected Image</h2>
            <img src={imageUrl} alt="Detected Objects" style={{ maxWidth: "100%" }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
