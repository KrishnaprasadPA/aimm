//import React from 'react';
//import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
//import Login from './components/Login';
//import Home from './components/Home';
//
//const App = () => {
//  return (
//    <Router>
//      <Routes>
//        <Route path="/login" element={<Login />} />
//        <Route
//          path="/home"
//          element={
//            localStorage.getItem('loggedUser') ? <Home /> : <Navigate to="/login" replace />
//          }
//        />
//        <Route path="/" element={<Navigate to="/login" replace />} />
//      </Routes>
//    </Router>
//  );
//};
//
//export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;