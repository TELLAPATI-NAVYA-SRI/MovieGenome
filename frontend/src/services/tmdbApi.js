import axios from 'axios';

// 🔑 Replace this with your actual TMDb API key
const API_KEY = 'e3606eee6f34bcaf9b5611a555a192b6';  
const BASE_URL = 'https://api.themoviedb.org/3';

// Fetch popular movies for the "All Movies" or "Browse" page
export const fetchPopularMovies = async () => {
    let allMovies = [];
    for (let page = 1; page <= 15; page++) {  // Fetch 3 pages → 60 movies
        const response = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
        allMovies = allMovies.concat(response.data.results);
    }
    return allMovies;
};

// Fetch details of a specific movie by its TMDb ID
export const fetchMovieDetails = async (movieId) => {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
    return response.data;
};

// Search movies by text query (for search bar functionality)
export const searchMovies = async (query) => {
    const response = await axios.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    return response.data.results;
};

// Fetch similar movies for recommendations ("More Like This")
export const fetchSimilarMovies = async (movieId) => {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}`);
    return response.data.results;
};

// Fetch YouTube trailer for a specific movie
export const fetchMovieTrailer = async (movieId) => {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    const videos = response.data.results;
    // Find a video that's a YouTube trailer
    return videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
};

// Fetch movies by mood keywords
export const fetchMoviesByMood = async (mood) => {
    const moodGenreIdMap = {
        "Exciting": [28, 53, 878, 12],         // Action, Thriller, Sci-Fi, Adventure
        "Relaxing": [10749, 35, 10751, 14],    // Romance, Comedy, Family, Fantasy
        "Adventurous": [12, 14, 878, 9648],    // Adventure, Fantasy, Sci-Fi, Mystery
        "Dramatic": [18, 36, 80, 9648],        // Drama, History, Crime, Mystery
        "Fun": [35, 16, 10751]                 // Comedy, Animation, Family
    };

    const genreIds = moodGenreIdMap[mood] || [];

    if (genreIds.length === 0) return [];

    const genreParam = genreIds.join(',');
    console.log(genreParam)

    try {
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreParam}&language=en-US&sort_by=popularity.desc&include_adult=false&page=1`
        );
        console.log(response)
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            console.log(`No movies found for mood: ${mood}`);
            return [];
        }

        // Optional: only return movies with posters and titles
        return data.results.filter(movie => movie.poster_path && movie.title);

    } catch (error) {
        console.error(`Error fetching movies for mood ${mood}:`, error);
        return [];
    }
};




export async function fetchSimilarMoviesForFavorites(favoriteMovieIds) {
    const allRecommendations = [];

    for (let movieId of favoriteMovieIds) {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();

        if (data && data.results) {
            // Take top 3 similar movies for each favorite
            data.results.slice(0, 3).forEach(movie => {
                if (!allRecommendations.some(m => m.id === movie.id)) {
                    allRecommendations.push({
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path,
                        genre_ids: movie.genre_ids,
                        release_date: movie.release_date
                    });
                }
            });
        }
    }

    return allRecommendations.slice(0, 20); // max 20 total recommendations
}





export const fetchGenreMap = async () => {
    const response = await axios.get(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
    const genreArray = response.data.genres;  // Array of { id, name }
    const map = {};
    genreArray.forEach(genre => {
        map[genre.id] = genre.name;
    });
    return map;   // Returns an object like { 28: 'Action', 12: 'Adventure', ... }
};
export function findGenomeSimilarMovies(targetMovie, allMovies, maxResults = 8) {
    return allMovies
        .filter(m => m.id !== targetMovie.id)
        .map(m => ({
            ...m,
            similarityScore: computeGenomeSimilarity(targetMovie, m)
        }))
        .filter(m => m.similarityScore > 0)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, maxResults);
}
export function computeGenomeSimilarity(movieA, movieB) {
    let score = 0;

    // 1️⃣ Genre similarity
    const genresA = movieA.genre_ids || [];
    const genresB = movieB.genre_ids || [];
    const commonGenres = genresA.filter(g => genresB.includes(g)).length;
    score += commonGenres * 5;

    // 2️⃣ Keyword similarity (you'll need to fetch keywords separately for both movies)
    const keywordsA = movieA.keywords || [];
    const keywordsB = movieB.keywords || [];
    const commonKeywords = keywordsA.filter(k => keywordsB.includes(k)).length;
    score += commonKeywords * 4;

    // 3️⃣ Director match
    const directorA = movieA.director || "";
    const directorB = movieB.director || "";
    if (directorA && directorB && directorA === directorB) {
        score += 5;
    }

   

    

    // 6️⃣ Language match
    const langA = movieA.original_language;
    const langB = movieB.original_language;
    if (langA && langB && langA === langB) {
        score += 2;
    }

    // 7️⃣ Production company match
    const prodA = movieA.production_companies ? movieA.production_companies.map(c => c.id) : [];
    const prodB = movieB.production_companies ? movieB.production_companies.map(c => c.id) : [];
    const commonProd = prodA.filter(id => prodB.includes(id)).length;
    score += commonProd * 2;

    return score;
}
