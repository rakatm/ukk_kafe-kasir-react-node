import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login';

function App() {
  if (sessionStorage.getItem('logged') !== "true") {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* <Route path='*' element={<NotFound />} /> */}
        </Routes>
      </Router>
    )
}
}
export default App;
