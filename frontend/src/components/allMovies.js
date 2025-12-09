import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AllMovies.css";
import MovieCard from "./movieCard";
import { fetchPopularMovies, fetchGenreMap } from "../services/tmdbApi";

function AllMovies() {
  const [movies, setMovies] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const moviesPerPage = 10;

  useEffect(() => {
    const loadMovies = async () => {
      const genres = await fetchGenreMap();
      setGenreMap(genres);

      const moviesData = await fetchPopularMovies(); // 15 pages → 300 movies
      const formattedMovies = moviesData.map(movie => ({
        id: movie.id,
        title: movie.title,
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "https://via.placeholder.com/300x450?text=No+Image",
        genres: movie.genre_ids.map(id => genres[id] || "Unknown").join(", "),
        release: movie.release_date ? movie.release_date.split("-")[0] : "Unknown"
      }));
      setMovies(formattedMovies);
    };

   
  

    loadMovies();
  }, []
  );
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Calculate which movies to show on the current page
  // const indexOfLastMovie = currentPage * moviesPerPage;
  // const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  //const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);

  // // Total number of pages
  // const totalPages = Math.ceil(movies.length / moviesPerPage);

  return (
    <div>
      <nav className="navbar">
          <h2 className="logo"> CineGenome</h2>
          <div className="nav-links">
            <a href="/myCollection">My Collection</a>
            <a href="/browse">Browse</a>
            <a href="#" onClick={() => {
                localStorage.removeItem("cineGenomeUser");
                window.location.href = "/";  // Redirect to login or home page
            }}>Logout</a>
          </div>
          <input 
            type="text" 
            placeholder="Search movies..." 
            className="search-bar"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </nav>



      <div className="all-movies-container">
        <h2 className="section-title">🎬 All Movies</h2>

        <div className="movies-grid">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
              <Link to={`/movie/${movie.id}`} className="movie-card-link" key={movie.id}>
                <div className="movie-card">
                  <img src={movie.image} alt={movie.title} />
                  <h3>{movie.title}</h3>
                  <p>{movie.genres} - {movie.release}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>No movies found.</p>
          )}
        </div>

        {/* Pagination */}
        {/* <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span> Page {currentPage} of {totalPages} </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default AllMovies;
