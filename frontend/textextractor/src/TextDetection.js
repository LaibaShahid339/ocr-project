import React, { useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import './TextDetection.css';
import './FrontScreen.css';
import { useNavigate } from "react-router-dom";

function TextDetection() {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [cameraModalIsOpen, setCameraModalIsOpen] = useState(false);
  const navigator = useNavigate();
  const handleShareScreen = () =>{
    navigator('/ScreenText')
  }
  const handleCapture = () => {
    setCameraModalIsOpen(true); // Open camera modal
  };

  const handleSavePhoto = async (imageSrc) => {
    // Convert Base64 to Blob
    const base64Response = await fetch(imageSrc);
    const blob = await base64Response.blob();
    const file = new File([blob], "captured_image.jpg", { type: 'image/jpeg' });

    setImage(file);
    setImagePreview(imageSrc);
    setCameraModalIsOpen(false);
    setModalIsOpen(true); // Open result modal when photo is saved
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImage(file);
        setModalIsOpen(true); // Open result modal when file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://127.0.0.1:5000/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.text) {
        setExtractedText(response.data.text);
      } else {
        setExtractedText('No text detected');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  useEffect(() => {
    if (modalIsOpen && image) {
      handleUpload(); // Automatically extract text when modal opens
    }
  }, [modalIsOpen, image]);

  const closeModal = () => {
    setModalIsOpen(false);
    setImagePreview(null);
    setExtractedText('');
    setImage(null); // Clear image state to ensure a fresh start on next use
  };

  const closeCameraModal = () => {
    setCameraModalIsOpen(false);
  };

  return (
    <div className="abc">
      <h1>Text Extractor</h1>

      <div className="but">
        <button onClick={handleCapture}>
          Access Camera
          <i className="fas fa-camera"></i>
        </button>
        <input type="file" id="file-upload" onChange={handleFileUpload} />
        <label htmlFor="file-upload">
          Upload From Device
          <i className="fas fa-image"></i>
        </label>
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

      {/* Modal for displaying the detected image and extracted text */}
      {modalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Detected Image</h2>
            {imagePreview && (
              <img src={imagePreview} alt="Detected Objects" style={{ maxWidth: "100%" }} />
            )}
            <div className="extracted-text-container">
              <h2>Extracted Text:</h2>
              <p>{extractedText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TextDetection ;
