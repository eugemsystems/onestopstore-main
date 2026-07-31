"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire up to newsletter API
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-l-md focus:ring-primary focus:border-primary text-sm outline-none bg-white"
            placeholder="Your email"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary/80 transition-colors text-white px-6 py-4 rounded-r-md font-medium text-sm whitespace-nowrap"
          >
            Subscribe
          </button>
        </div>
      </form>
      <p className="mt-3 text-xs text-gray-400">
        *We don&apos;t send you spam message
      </p>
    </>
  );
};

export default NewsletterForm;
