import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AllMovies.css";
import MovieCard from "./movieCard";

function MyCollection() {
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredMovies, setFilteredMovies] = useState([]);

    useEffect(() => {
        const fetchFavorites = async () => {
            const user = JSON.parse(localStorage.getItem("cineGenomeUser"));
            if (!user) {
                alert("Please log in to see your collection.");
                return;
            }

            const res = await fetch(`http://3.142.171.217:5000/api/get-favorites?userId=${user.userId}`);
            const data = await res.json();
            setFavoriteMovies(data.favorites || []);
        };

        fetchFavorites();
    }, []);

    useEffect(() => {
        const results = favoriteMovies.filter(movie =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMovies(results);
    }, [searchQuery, favoriteMovies]);

    return (
        <div>
            <nav className="navbar">
                <h2 className="logo"> CineGenome</h2>
                <div className="nav-links">
                    <a href="/myCollection" className="active">My Collection</a>
                    <a href="/browse">Browse</a>
                    <a href="#" onClick={() => {
                    localStorage.removeItem("cineGenomeUser");
                    window.location.href = "/";  // Redirect to login or home page
                }}>Logout</a>
                </div>
                

                <input
                    type="text"
                    placeholder="Search by movie name..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                
            </nav>
         


            <div className="all-movies-container">
                <h2 className="section-title">🎬 My Collection</h2>

                <div className="movies-grid">
                    {filteredMovies.length > 0 ? (
                        filteredMovies.map((movie, index) => (
                            <Link to={`/movie/${movie.id}`} key={index} className="movie-card-link">
                                <MovieCard
                                    movie={{
                                        id: movie.id,
                                        title: movie.title,
                                        image: movie.poster_path
                                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                            : "https://via.placeholder.com/300x450?text=No+Image",
                                        type: movie.genres || "Unknown",
                                        release: movie.release_date ? movie.release_date.split("-")[0] : "Unknown"
                                    }}
                                />
                            </Link>
                        ))
                    ) : (
                        <p>No favorites found{searchQuery ? " for your search." : " yet!"}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyCollection;
