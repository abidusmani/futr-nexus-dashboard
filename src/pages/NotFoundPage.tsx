import React from 'react';
import { Link } from 'react-router-dom';
// Use the public/ folder at runtime by referencing the file from the root path
// Vite serves files from `public/` at the site root (e.g. /mainlogo.png)

/**
 * A "Page Not Found" component styled to match the provided image.
 * Assumes Tailwind CSS is set up in your project.
 * Requires `react-router-dom` for the <Link> component.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#00529B] text-white p-6 text-center font-['Inter'] relative">
      {/* Logo */}
      <div className="mb-10">
        {/* Render project logo image instead of text.
            The image is located in the `public/` folder and is served at `/mainlogo.png`.
            Don't import files from `public/` — reference them by URL instead. */}
        <img src="/mainlogo.png" alt="DS Energize" className="h-28 w-auto mx-auto" />
      </div>

      {/* 404 Heading */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        404 - Page Not Found
      </h1>

      {/* Subtext */}
      <p className="text-lg md:text-xl max-w-md mb-10">
        The page you're looking for doesn't exist or might have been moved.
      </p>

      {/* Go Back Home Button */}
      <Link
        to="/"
        className="px-8 py-3 bg-white text-[#00529B] font-bold rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-300"
      >
        Go Back Home
      </Link>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-blue-200">
  © 2025 DS Energize | Solar RMS Platform
      </footer>
    </div>
  );
}