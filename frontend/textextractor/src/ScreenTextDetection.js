import React, { useRef, useState, useEffect } from 'react';
import './FrontScreen.css';

function ScreenTextDetection() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const captureInterval = useRef(null);

    const startCapturing = async () => {
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

    const closeModal = () => {
        // Close the modal and stop capturing
        setIsModalOpen(false);
        stopCapturing();
    };

    const stopCapturing = () => {
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
        setExtractedText(''); // Clear the extracted text
    };

    useEffect(() => {
        // Cleanup when component unmounts
        return () => {
            stopCapturing();
        };
    }, []);

    return (
        <div className='abc'>
            <h1>Screen Sharing</h1>
            <div className='but'>
                <button onClick={startCapturing} disabled={loading || captureInterval.current}>
                    {loading ? 'Starting...' : 'Start Capturing'}
                </button>
                <button onClick={stopCapturing} disabled={!captureInterval.current}>
                    Stop Capturing
                </button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <video ref={videoRef} style={{ display: 'none' }}></video>

            {/* Modal for displaying the extracted text */}
            {isModalOpen && (
                <div className="modal-share">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Extracted Text</h2>
                        <p>{extractedText}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScreenTextDetection;
