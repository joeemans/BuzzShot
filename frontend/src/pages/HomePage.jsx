import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Page from "./Page";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1536 }, items: 8 },
  desktop: { breakpoint: { max: 1536, min: 1024 }, items: 8 },
  tablet: { breakpoint: { max: 1024, min: 768 }, items: 3 },
  mobile: { breakpoint: { max: 768, min: 0 }, items: 1.5 },
};

const carouselSettings = {
  responsive,
  ssr: true,
  infinite: true,
  autoPlay: true,
  autoPlaySpeed: 2000,
  keyBoardControl: true,
  customTransition: "all 0.5s ease",
  transitionDuration: 500,
  containerClass: "carousel-container",
  removeArrowOnDeviceType: ["tablet", "mobile"],
  itemClass: "carousel-item-padding-40-px",
  showDots: false,
};

const renderStars = (rating) => {
  const stars = [];
  const rounded = Math.round(rating / 2);
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rounded ? "⭐" : "✩");
  }
  return stars.join("");
};

const HomePage = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          fetch(
            "https://api.themoviedb.org/3/trending/movie/day?language=en-US",
            {
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
              },
            },
          ),
          fetch(
            "https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1",
            {
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
              },
            },
          ),
        ]);

        const moviesData = await moviesRes.json();
        const seriesData = await seriesRes.json();

        setTrendingMovies(moviesData.results || []);
        setTrendingSeries(seriesData.results || []);
      } catch (error) {
        console.error("Error fetching trending data from backend", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // Live search with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const debounceTimeout = setTimeout(() => {
      const fetchSearch = async () => {
        setSearchLoading(true);

        const url = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(
          searchTerm,
        )}`;
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          },
        };

        try {
          const res = await fetch(url, options);
          const data = await res.json();
          setSearchResults(data.results || []);
        } catch (error) {
          console.error("Error searching TMDb", error);
        } finally {
          setSearchLoading(false);
        }
      };

      fetchSearch();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  return (
    <Page>
      {/* Hero Section */}
      <section className="mb-12 rounded-xl bg-gradient-to-b from-black to-gray-900 py-12 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">
          Welcome to BuzzShot 🎬
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-300">
          Discover the hottest movies and shows. Stay in the loop with what's
          trending now.
        </p>

        {/* Search Bar */}
        <div className="mx-auto mt-6 flex max-w-md">
          <input
            type="text"
            placeholder="Search..."
            className="flex-grow rounded-l-md border border-gray-600 bg-gray-900 px-4 py-2 text-white focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Loading indicator */}
      {(loading || searchLoading) && (
        <p className="text-center text-lg text-white">Loading content...</p>
      )}

      {/* Search Results */}
      {!loading && searchTerm.trim() && (
        <section className="mb-10">
          <h2 className="mb-3 text-3xl font-semibold text-white">
            🔍 Search Results for "{searchTerm}"
          </h2>
          {searchResults.length > 0 ? (
            <Carousel {...carouselSettings}>
              {searchResults.map((movie) => (
                <Link
                  to={`/detail/movie/${movie.id}`}
                  key={movie.id}
                  className="block px-2"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                  />
                  <h3 className="mt-2 text-sm font-medium text-white">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {renderStars(movie.vote_average)} (
                    {movie.vote_average.toFixed(1)})
                  </p>
                </Link>
              ))}
            </Carousel>
          ) : (
            <p className="text-center text-gray-400">No results found.</p>
          )}
        </section>
      )}

      {/* Trending content fallback */}
      {!loading && !searchTerm.trim() && (
        <>
          {/* Trending Movies */}
          {trendingMovies.length > 0 && (
            <section className="mb-16">
              <h2 className="mb-3 text-3xl font-semibold text-white">
                🔥 Trending Movies
              </h2>
              <p className="mb-6 text-gray-400">
                Check out what's making waves in cinemas today.
              </p>
              <Carousel {...carouselSettings}>
                {trendingMovies.map((movie) => (
                  <Link
                    to={`/detail/movie/${movie.id}`}
                    key={movie.id}
                    className="block px-2"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                    />
                    <h3 className="mt-2 text-sm font-medium text-white">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {renderStars(movie.vote_average)} (
                      {movie.vote_average.toFixed(1)})
                    </p>
                  </Link>
                ))}
              </Carousel>
            </section>
          )}

          {/* Trending Series */}
          {trendingSeries.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-3xl font-semibold text-white">
                📺 Top Rated Series
              </h2>
              <p className="mb-6 text-gray-400">
                Binge-worthy series loved by audiences worldwide.
              </p>
              <Carousel {...carouselSettings}>
                {trendingSeries.map((show) => (
                  <Link
                    to={`/detail/tv/${show.id}`}
                    key={show.id}
                    className="block px-2"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w300${show.poster_path}`}
                      alt={show.name}
                      className="w-full rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                    />
                    <h3 className="mt-2 text-sm font-medium text-white">
                      {show.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {renderStars(show.vote_average)} (
                      {show.vote_average.toFixed(1)})
                    </p>
                  </Link>
                ))}
              </Carousel>
            </section>
          )}
        </>
      )}
    </Page>
  );
};

export default HomePage;
