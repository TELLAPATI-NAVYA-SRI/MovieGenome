import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Browse from "./components/browse";
import AllMovies from "./components/allMovies";
import MovieDetails from "./components/movieDetails";
import MyCollection from "./components/myColletion";
import ResetPassword from "./components/resetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/allMovies" element={<AllMovies />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/myCollection" element={<MyCollection />} />
        <Route path="/reset-password" element={<ResetPassword />}/>
      </Routes>
    </Router>
  );
}

export default App;

