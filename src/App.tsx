import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapPage from './pages/mapPage/MapPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<MapPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
