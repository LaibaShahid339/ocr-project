from flask import Flask, request, jsonify, send_file
from PIL import Image
import pytesseract
import io
from flask_cors import CORS
import cv2
import numpy as np



# Set the Tesseract-OCR executable path
pytesseract.pytesseract.tesseract_cmd ="C:/Users/PMLS/Desktop/tesseract/tesseract.exe"

#object detection model paths and preprocessing 
frozen_model = "frozen_inference_graph.pb"
file_names = "labels.txt"
config_file = "ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt"
model = cv2.dnn_DetectionModel(frozen_model , config_file )

with open (file_names, "rt") as fpt:
    class_labels = fpt.read().rstrip('\n').split('\n')

# print(class_labels)
model.setInputScale(1.0/127.5)
model.setInputSize(320, 320)
model.setInputMean((127.5, 127, 5, 127.5))
model.setInputSwapRB(True)


#app start 
app = Flask(__name__)

# Enable CORS
CORS(app)

@app.route('/')
def index():
    return "Welcome to the Text Extractor API!"

@app.route('/extract-text', methods=['POST'])
def extract_text():
    file = request.files['image']
    img = Image.open(io.BytesIO(file.read()))
    text = pytesseract.image_to_string(img)
    return jsonify({'text': text})




@app.route('/object-detection', methods=['POST'])
def object_detection():
    file = request.files['image']
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)

    # Perform object detection
    ClassIndex, confidence, bbox = model.detect(img, confThreshold=0.5)

    # Draw bounding boxes on the image
    if ClassIndex is not None and len(ClassIndex) > 0:
        for ClassInd, conf, boxes in zip(ClassIndex.flatten(), confidence.flatten(), bbox):
            cv2.rectangle(img, boxes, color=(255, 0, 0), thickness=2)
            cv2.putText(img, class_labels[ClassInd - 1], (boxes[0] + 10, boxes[1] + 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    else:
    # Define the text and properties
        text = 'No Object Detected'
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 1
        font_color = (255, 255, 255)  # White color in BGR
        font_thickness = 3
        box_color = (0, 0, 0)  # Black color in BGR for the bounding box
        box_thickness = 2

    # Calculate the size of the text
        (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, font_thickness)

    # Set position for the text (upper right corner)
        position = (img.shape[1] - text_width - 10, text_height + 10)  # 10 pixels margin

    # Draw the bounding box
        cv2.rectangle(img, (position[0] - 10, position[1] - text_height - 10),
                      (position[0] + text_width + 10, position[1] + 10), box_color, cv2.FILLED)

    # Add text to the image
        cv2.putText(img, text, position, font, font_scale, font_color, font_thickness, lineType=cv2.LINE_AA)


    # Convert the image to bytes
    _, buffer = cv2.imencode('.jpg', img)
    img_bytes = io.BytesIO(buffer)
    return send_file(img_bytes, mimetype='image/jpeg')


if __name__ == '__main__':
    app.run(debug=True)


