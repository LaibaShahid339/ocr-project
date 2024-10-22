Text and Object Detection App
This is a web-based application that allows users to capture or upload images to extract text using Optical Character Recognition (OCR) or detect objects using a Python backend server. The application is built with React for the frontend, and the backend uses Flask for object detection.

Features:
Text Extraction: Extract text from images using the Tesseract OCR engine on a Flask backend.
Object Detection: Detect objects in images using a Python backend server powered by OpenCV and pre-trained models.
Capture Image: Users can capture an image using their device's camera or upload one from their local storage.
Screen Sharing: Allows users to share their screen to detect text in real-time.
Interactive UI: The application provides an easy-to-use interface with modals for image previews and text extraction results.

Technologies Used

Frontend:
React: For building the user interface.
Webcam: For accessing the camera and capturing images.
Axios: For making HTTP requests to the backend server.
React Router: For navigation between pages.
CSS: For styling and layout of the application.

Backend:
Flask: Python web framework used to handle HTTP requests and integrate OCR and object detection models.
OpenCV: For performing object detection using pre-trained models.
Tesseract: For Optical Character Recognition (OCR) to extract text from images.

How It Works

Text Detection Flow:
Image Capture/Upload: Users can capture an image using their device's camera or upload one from their local files.
Send Image to Backend: The image is sent to the Flask backend where it is processed using Tesseract for text extraction.
Display Extracted Text: The extracted text is sent back to the frontend and displayed in a modal.

Object Detection Flow:
Image Upload: Users upload an image that is sent to the Flask backend server.
Object Detection: The backend processes the image using OpenCV with a pre-trained model and detects objects in the image.
Return Results: The results, including detected objects and bounding boxes, are returned to the frontend.
