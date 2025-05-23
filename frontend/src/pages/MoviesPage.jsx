import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Page from "./Page";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1536 }, items: 8 },
  desktop: { breakpoint: { max: 1536, min: 1024 }, items: 6 },
  tablet: { breakpoint: { max: 1024, min: 640 }, items: 4 },
  mobile: { breakpoint: { max: 640, min: 0 }, items: 2 },
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

const MoviesPage = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [trendingRes, topRatedRes, upcomingRes, nowPlayingRes] =
          await Promise.all([
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
              "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
              {
                headers: {
                  accept: "application/json",
                  Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                },
              },
            ),
            fetch(
              "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1",
              {
                headers: {
                  accept: "application/json",
                  Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                },
              },
            ),
            fetch(
              "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
              {
                headers: {
                  accept: "application/json",
                  Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                },
              },
            ),
          ]);

        const [trendingData, topRatedData, upcomingData, nowPlayingData] =
          await Promise.all([
            trendingRes.json(),
            topRatedRes.json(),
            upcomingRes.json(),
            nowPlayingRes.json(),
          ]);

        setTrendingMovies(trendingData.results || []);
        setTopRatedMovies(topRatedData.results || []);
        setUpcomingMovies(upcomingData.results || []);
        setNowPlayingMovies(nowPlayingData.results || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <Page>
      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-center text-lg text-white">Loading content...</p>
        </div>
      ) : (
        <div className="space-y-12 md:space-y-16">
          {/* Trending Movies */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold text-white md:mb-3 md:text-3xl">
              🔥 Trending Movies
            </h2>
            <p className="mb-4 text-sm text-gray-400 md:mb-6 md:text-base">
              What's making waves in cinemas today.
            </p>
            <Carousel {...carouselSettings}>
              {trendingMovies.map((movie) => (
                <Link
                  to={`/detail/movie/${movie.id}`}
                  key={movie.id}
                  className="block px-1 md:px-2"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-medium text-white md:text-sm">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 md:text-xs">
                    {renderStars(movie.vote_average)} (
                    {movie.vote_average.toFixed(1)})
                  </p>
                </Link>
              ))}
            </Carousel>
          </section>

          {/* Top Rated Movies */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold text-white md:mb-3 md:text-3xl">
              ⭐ Top Rated Movies
            </h2>
            <p className="mb-4 text-sm text-gray-400 md:mb-6 md:text-base">
              The highest-rated movies of all time.
            </p>
            <Carousel {...carouselSettings}>
              {topRatedMovies.map((movie) => (
                <Link
                  to={`/detail/movie/${movie.id}`}
                  key={movie.id}
                  className="block px-1 md:px-2"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-medium text-white md:text-sm">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 md:text-xs">
                    {renderStars(movie.vote_average)} (
                    {movie.vote_average.toFixed(1)})
                  </p>
                </Link>
              ))}
            </Carousel>
          </section>

          {/* Now Playing Movies */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold text-white md:mb-3 md:text-3xl">
              🎬 Now Playing
            </h2>
            <p className="mb-4 text-sm text-gray-400 md:mb-6 md:text-base">
              Movies currently in theaters.
            </p>
            <Carousel {...carouselSettings}>
              {nowPlayingMovies.map((movie) => (
                <Link
                  to={`/detail/movie/${movie.id}`}
                  key={movie.id}
                  className="block px-1 md:px-2"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-medium text-white md:text-sm">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 md:text-xs">
                    {renderStars(movie.vote_average)} (
                    {movie.vote_average.toFixed(1)})
                  </p>
                </Link>
              ))}
            </Carousel>
          </section>

          {/* Upcoming Movies */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold text-white md:mb-3 md:text-3xl">
              📅 Upcoming Movies
            </h2>
            <p className="mb-4 text-sm text-gray-400 md:mb-6 md:text-base">
              Coming soon to theaters near you.
            </p>
            <Carousel {...carouselSettings}>
              {upcomingMovies.map((movie) => (
                <Link
                  to={`/detail/movie/${movie.id}`}
                  key={movie.id}
                  className="block px-1 md:px-2"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-medium text-white md:text-sm">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 md:text-xs">
                    {renderStars(movie.vote_average)} (
                    {movie.vote_average.toFixed(1)})
                  </p>
                </Link>
              ))}
            </Carousel>
          </section>
        </div>
      )}
    </Page>
  );
};

export default MoviesPage;
