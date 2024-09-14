import React from 'react';
import TextDetection from './TextDetection';
import FrontScreen from './FrontScreen';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ObjectDetection from './ObjectDetection';
import ScreenObjectDetection from './ScreenObjectDetection';
import ScreenTextDetection from './ScreenTextDetection';
function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<FrontScreen/>} />
        <Route path = "/image" element = {<TextDetection/>}/>
        <Route path= "/object" element={<ObjectDetection/>} />
        <Route path= "/ScreenText" element={<ScreenTextDetection/>} />
        <Route path= "/ScreenObject" element={<ScreenObjectDetection/>} />
      </Routes>
    </Router>
 
  );
}

export default App;
