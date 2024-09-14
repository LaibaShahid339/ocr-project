import React from 'react'
import './FrontScreen.css'
import { useNavigate } from 'react-router-dom'



const FrontScreen = () => {
    const navigate = useNavigate();
    const handleExtracttext = () =>{
        navigate("./image");
    }
    const handleObjectDetection = () =>{
      navigate("/object");
    }
  return (

    <div className='abc'>
    <h1>
        Welcome To the Text and Object Detection App
    </h1>
    <div className='but'>
    <button onClick ={handleExtracttext}   aria-label="Extract text from image">Extract Text</button>
    <button onClick={handleObjectDetection} aria-label="Detect objects in image">Object Detection</button>
    </div>
    </div>
  )
}

export default FrontScreen