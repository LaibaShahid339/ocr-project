import React from 'react';
import TextDetection from './TextDetection';
import FrontScreen from './FrontScreen';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ObjectDetection from './ObjectDetection';
function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<FrontScreen/>} />
        <Route path = "/image" element = {<TextDetection/>}/>
        <Route path= "/object" element={<ObjectDetection/>} />

      </Routes>
    </Router>
 
  );
}

export default App;
