import React, {useRef, useState, useEffect } from 'react'
import './FrontScreen.css'
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TextDetection = () => {
 const [cameraModalIsOpen, setCameraModalIsOpen] = useState(false);
 const [imageUrl, setImageUrl] = useState("");
 const [capturedImage, setCapturedImage] = useState(false);
 const [error, setError] = useState(false);
 const [cameraAccess, setCameraAccess] = useState(false);
 const [permissionModal, setPermissionModal] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
const fileInputRef = useRef(null); 
const [screenShare, setScreenshare] = useState(false);
const [openTabs, setOpenTabs] = useState(null);
const [extractedText, setExtractedText] = useState('');
const videoRef = useRef(null);
const captureInterval = useRef(null);
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(null);
const streamRef = useRef(null);

  const navigator1 = useNavigate();
  const handleBackButton = () => {
    navigator1(-1);
  };

const closeAll = () => {
  setCameraModalIsOpen(false);
  setImageUrl("");
  setError(false);
  setCapturedImage(false);
  setCameraAccess(false);
  setPermissionModal(false);
  setIsModalOpen(false);
  if (fileInputRef.current){
    fileInputRef.current.value = "";
  }
  if (captureInterval.current) {
    clearInterval(captureInterval.current);
    captureInterval.current = null;
}

  
if (streamRef.current) {
  streamRef.current.getTracks().forEach(track => track.stop());
}

if (videoRef.current) {
  videoRef.current.srcObject = null;
}

setSuccess(null);
setError(null);
setExtractedText('');
}

 const handleCameraPermission = () => {
  setPermissionModal(true);
 }
 const handleDeny = () => {
  console.log("permission Denied")
  setPermissionModal(false);
  setScreenshare(false);
 }

 const openCameraModal = () => {
  setCameraAccess(true);
  setPermissionModal(false);
  setError(false); // Reset error when reopening the modal
  setCameraModalIsOpen(true);
};

const closeCameraModal = () => {
  setCameraAccess(false);
  setCameraModalIsOpen(false);
  setCapturedImage(null);
};

// // Upload image and handle detection
// const uploadAndExtractText = async (file) => {
//   const formData = new FormData();
//   formData.append("image", file);

//   try {
//     const response = await axios.post("http://127.0.0.1:5000/object-detection", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//       responseType: "blob", // Important for receiving image blob
//     });

//     // Create a URL for the image blob
//     const imageBlob = response.data;
//     const imageObjectUrl = URL.createObjectURL(imageBlob);
//     setImageUrl(imageObjectUrl);
//     setIsModalOpen(true); // Open the modal when image is ready
//   } catch (error) {
//     console.error("Error during object detection:", error);
//     alert("An error occurred while processing the image.");
//   }
// };
const uploadAndExtractText = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post("http://127.0.0.1:5000/extract-text", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Extract the text from the response
    const extractedTexts = response.data.text;
    console.log("Extracted text:", extractedText);

    // You can now display the extracted text in your frontend
    if (!extractedTexts){
      setExtractedText("No Text Detected");
      setIsModalOpen(true);
    }
    else{
      setExtractedText(extractedTexts); // Assuming you have a state for extracted text
      setIsModalOpen(true);
    }
 // Open the modal when text is ready
  } catch (error) {
    console.error("Error during text extraction:", error);
    alert("An error occurred while extracting text from the image.");
  }
};

// Handle image capture from the camera
const handleSavePhoto = async (imageSrc) => {
  // Convert Base64 to Blob
  const base64Response = await fetch(imageSrc);
  const blob = await base64Response.blob();
  const file = new File([blob], "captured_image.jpg", { type: 'image/jpeg' });

  setCapturedImage(file);
  setCameraModalIsOpen(false); // Close camera modal
  await uploadAndExtractText(file); // Trigger detection with the captured image
  console.log(isModalOpen);
};

const handleCameraError = () => {
  setError(true);
  alert("Camera access denied. Please allow access to use the camera.");
};
const handleFileUpload = () => {
  fileInputRef.current.click();
}
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file){
    await(uploadAndExtractText(file));
  }
}
const handlescreenSharing = () => {
  setScreenshare(true);
}


const startCapturing = async () => {
  setScreenshare(false);
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
      // Capture the current tab
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      // Set interval to capture frames and send to backend
      captureInterval.current = setInterval(async () => {
          const blob = await captureFrame();
          await sendToBackend(blob);
      }, 5000); // Capture every 5 seconds
  } catch (err) {
      console.error('Error accessing screen:', err);
      setError('Error accessing screen');
  } finally {
      setLoading(false);
  }
};

const captureFrame = () => {
  return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
          resolve(blob);
      }, 'image/jpeg');
  });
};

const sendToBackend = async (blob) => {
  const formData = new FormData();
  formData.append('image', blob, 'capture.jpg');

  try {
      const response = await fetch('http://127.0.0.1:5000/extract-text', {
          method: 'POST',
          body: formData,
      });

      if (!response.ok) {
          throw new Error('Failed to send capture to backend');
      }

      const result = await response.json();
      displayExtractedText(result.text);
      setSuccess('Capture sent successfully');
  } catch (err) {
      console.error('Error sending capture to backend:', err);
      setError('Error sending capture to backend');
  }
};
const displayExtractedText = (text) => {
  setExtractedText(text);
  setIsModalOpen(true); // Open modal when text is extracted
};

  return (
    <div className='main'>
      
    <div className='buttons'>
    <button onClick={handleBackButton}>
        Back
      </button>
    <button onClick={handleCameraPermission}>
      Access Camera
    </button>
    <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          style={{ display: 'none' }}  // Hide the file input
          onChange={handleFileChange}
        />
    <button onClick={handleFileUpload}>
      File Upload
    </button>
    <button onClick={handlescreenSharing}>
      Share Screen
    </button>
    </div>
  {permissionModal && (
    <div className='modal'>
    <div className = "permission-modal-content">
      <h3>Allow Camera Access</h3>
      <div className='modal-buttons'>
        <button onClick={openCameraModal}>
          Allow
        </button>
        <button onClick= {handleDeny}>
          Deny
        </button>
      </div>
    </div>
    </div>
  )
  }
  {cameraModalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Capture Image</h2>
            {!error && cameraAccess? (
              <Webcam 
                audio={false}
                screenshotFormat="image/jpeg"
                className="webcam"
                videoConstraints={{ facingMode: "user" }}
                onUserMediaError={handleCameraError} // Handle camera permission denial
              >
                {({ getScreenshot }) => (
                  <div className='modal-buttons'>
                    <button
                      className="capture-button"
                      onClick={() => {
                        const screenshot = getScreenshot();
                        handleSavePhoto(screenshot);
                      }}
                    >
                      Capture
                    </button>
                    <button onClick={closeCameraModal}>Close</button>
                  </div>
                )}
              </Webcam>
            ) : (
              <p style={{ color: "red" }}>
                Camera access is required to capture images.
              </p>
            )}
          </div>
        </div>
      )}
      {screenShare &&(
        <div className='modal'>
        <div className='permission-modal-content'>
          Allow Screen Sharing
          <div className='modal-buttons'>
            <button onClick={startCapturing}  disabled={loading || captureInterval.current}>
              Allow
            </button>
            <button onClick={handleDeny}>
              Deny
            </button>
          </div>
        </div>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <video ref={videoRef} style={{ display: 'none' }}></video>
      {isModalOpen &&(
        <div className='modals'>
        <div className='modal-contents'>
            <p>{extractedText}</p>
          <div className='modal-buttonss'>
          <button onClick={closeAll}>
            Close
          </button>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}

export default TextDetection
