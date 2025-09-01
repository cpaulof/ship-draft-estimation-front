import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import NewReport from './pages/NewReport';
import Connection from './pages/Connection';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} /> {/* Home page as default */}
        <Route path="/new-report" element={<NewReport />} />
        <Route path="/connection" element={<Connection />} />
      </Routes>
    </Router>
  );
}

export default App;
