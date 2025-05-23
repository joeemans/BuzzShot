import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform } from "framer-motion";
import buzzshotLogo from "../assets/BuzzShot_logo.png";
import { Link } from "react-router-dom";

const CoverPage = () => {
  const { scrollYProgress } = useScroll();

  // Background color gradient scroll effect
  const background = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "linear-gradient(to bottom, #1e3a8a, #2563eb)",
      "linear-gradient(to bottom, #059669, #10b981)",
      "linear-gradient(to bottom, #9333ea, #f43f5e)",
    ],
  );

  // Logo and Text position transforms
  const logoX = useTransform(scrollYProgress, [0, 1], [0, -150]); // Moves left
  const textX = useTransform(scrollYProgress, [0, 1], [0, 150]); // Moves right
  const logoY = useTransform(scrollYProgress, [0, 1], [0, 50]); // Moves up

  return (
    <motion.div
      style={{ background }}
      className="min-h-screen w-full overflow-x-hidden text-white"
    >
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <motion.div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0">
          <motion.img
            src={buzzshotLogo}
            alt="BuzzShot Logo"
            className="w-40 md:w-56"
            style={{ x: logoX, y: logoY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="max-w-2xl text-center md:text-left"
            style={{ x: textX }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Welcome to BuzzShot
            </h1>
            <p className="text-lg md:text-xl">
              Explore your favorite movies and series. Get the latest
              information, ratings, reviews, and recommendations from our
              community.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Paragraph at the end */}
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-20 text-lg text-white md:px-20">
        <p>
          BuzzShot is your go-to platform for discovering the latest movies and
          series. With detailed descriptions, user ratings, and reviews, you'll
          always know what's trending and what's worth watching.
        </p>
        <p>
          Leave your own ratings, share your thoughts with other users, and
          explore a wide variety of genres to find your next binge-worthy
          obsession. Whether you're into action, drama, comedy, or
          documentaries, BuzzShot has something for everyone.
        </p>
        <div className="flex flex-col items-center gap-8">
          <Link to="/signup">
            <button className="w-full max-w-lg rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-pink-600 hover:to-purple-700">
              Join Now
            </button>
          </Link>
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-300">
              Already a user?{" "}
              <Link
                to="/login"
                className="text-blue-400 transition-colors duration-200 hover:text-blue-500"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black px-6 py-10 text-white md:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 md:flex-row">
          <div>
            <h2 className="mb-2 text-2xl font-semibold">BuzzShot</h2>
            <p>Discover, Rate, and Review Movies & Series.</p>
          </div>
          <div>
            <h3 className="mb-1 text-xl font-semibold">Contact</h3>
            <p>Email: contact@buzzshot.app</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Address: 42 Web Lane, Internet City</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default CoverPage;
