import {Begin} from "./pages/Begin.tsx";
import {Home} from "./pages/Home.tsx";
import {BrowserRouter, Routes, Route} from "react-router-dom";
function App() {

  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Begin />} />
            <Route path="/mergulhos" element={<Home />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App
