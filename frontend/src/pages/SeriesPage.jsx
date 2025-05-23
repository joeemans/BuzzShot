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

const SeriesPage = () => {
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [topRatedSeries, setTopRatedSeries] = useState([]);
  const [airingTodaySeries, setAiringTodaySeries] = useState([]);
  const [onTheAirSeries, setOnTheAirSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        const [trendingRes, topRatedRes, airingTodayRes, onTheAirRes] =
          await Promise.all([
            fetch(
              "https://api.themoviedb.org/3/trending/tv/day?language=en-US",
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
            fetch(
              "https://api.themoviedb.org/3/tv/airing_today?language=en-US&page=1",
              {
                headers: {
                  accept: "application/json",
                  Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                },
              },
            ),
            fetch(
              "https://api.themoviedb.org/3/tv/on_the_air?language=en-US&page=1",
              {
                headers: {
                  accept: "application/json",
                  Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                },
              },
            ),
          ]);

        const [trendingData, topRatedData, airingTodayData, onTheAirData] =
          await Promise.all([
            trendingRes.json(),
            topRatedRes.json(),
            airingTodayRes.json(),
            onTheAirRes.json(),
          ]);

        setTrendingSeries(trendingData.results || []);
        setTopRatedSeries(topRatedData.results || []);
        setAiringTodaySeries(airingTodayData.results || []);
        setOnTheAirSeries(onTheAirData.results || []);
      } catch (error) {
        console.error("Error fetching series:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  return (
    <Page>
      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-center text-lg text-white">Loading content...</p>
        </div>
      ) : (
        <div className="space-y-12 md:space-y-16">
          {/* Trending Series */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold text-white md:mb-3 md:text-3xl">
              🔥 Trending Series
            </h2>
            <p className="mb-4 text-sm text-gray-400 md:mb-6 md:text-base">
              What's making waves in TV today.
            </p>
            <Carousel {...carouselSettings}>
              {trendingSeries.map((series) => (
                <Link
                  to={`/detail/tv/${series.id}`}
                  key={series.id}
                  className="block px-1 md:px-2"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${series.poster_path}`}
                      alt={series.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-medium text-white md:text-sm">
                    {series.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 md:text-xs">
                    {renderStars(series.vote_average)} (
                    {series.vote_average.toFixed(1)})
                  </p>
                </Link>
              ))}
            </Carousel>
          </section>

          {/* Top Rated Series */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold text-white md:mb-3 md:text-3xl">
              ⭐ Top Rated Series
            </h2>
            <p className="mb-4 text-sm text-gray-400 md:mb-6 md:text-base">
              The highest-rated TV series of all time.
            </p>
            <Carousel {...carouselSettings}>
              {topRatedSeries.map((series) => (
                <Link
                  to={`/detail/tv/${series.id}`}
                  key={series.id}
                  className="block px-1 md:px-2"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${series.poster_path}`}
                      alt={series.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-medium text-white md:text-sm">
                    {series.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 md:text-xs">
                    {renderStars(series.vote_average)} (
                    {series.vote_average.toFixed(1)})
                  </p>
                </Link>
              ))}
            </Carousel>
          </section>

          {/* Airing Today Series */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold text-white md:mb-3 md:text-3xl">
              📺 Airing Today
            </h2>
            <p className="mb-4 text-sm text-gray-400 md:mb-6 md:text-base">
              Series airing new episodes today.
            </p>
            <Carousel {...carouselSettings}>
              {airingTodaySeries.map((series) => (
                <Link
                  to={`/detail/tv/${series.id}`}
                  key={series.id}
                  className="block px-1 md:px-2"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${series.poster_path}`}
                      alt={series.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-medium text-white md:text-sm">
                    {series.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 md:text-xs">
                    {renderStars(series.vote_average)} (
                    {series.vote_average.toFixed(1)})
                  </p>
                </Link>
              ))}
            </Carousel>
          </section>

          {/* On The Air Series */}
          <section>
            <h2 className="mb-2 text-2xl font-semibold text-white md:mb-3 md:text-3xl">
              📡 Currently Airing
            </h2>
            <p className="mb-4 text-sm text-gray-400 md:mb-6 md:text-base">
              Series currently in production and airing.
            </p>
            <Carousel {...carouselSettings}>
              {onTheAirSeries.map((series) => (
                <Link
                  to={`/detail/tv/${series.id}`}
                  key={series.id}
                  className="block px-1 md:px-2"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${series.poster_path}`}
                      alt={series.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-xs font-medium text-white md:text-sm">
                    {series.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 md:text-xs">
                    {renderStars(series.vote_average)} (
                    {series.vote_average.toFixed(1)})
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

export default SeriesPage;
