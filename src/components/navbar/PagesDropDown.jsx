"use client";

import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";

//internal imports
import { pages } from "@utils/data";

const PagesDropDown = () => {
  return (
    <div className="relative group mt-3.5">
      {/* Trigger */}
      <button className="flex items-center p-1.5">
        <span className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          Pages
        </span>
        <FiChevronDown
          className="ml-1 h-3 w-3 group-hover:rotate-180 transition-transform duration-200"
          aria-hidden="true"
        />
      </button>

      {/* Hover dropdown panel */}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute right-0 top-full pt-1 z-50 transition-all duration-200 ease-in-out">
        <div className="w-60 origin-top-right rounded-lg bg-card py-2 shadow-lg ring-1 ring-border">
          {pages.map((item) => (
            <div
              key={item.title}
              className="px-6 py-1 hover:bg-accent hover:text-primary transition-colors"
            >
              <div className="w-full flex">
                <item.icon className="my-auto text-muted-foreground" />
                <Link
                  href={item.href}
                  className="block px-3 py-1 text-sm leading-6 text-foreground hover:text-primary"
                >
                  {item.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PagesDropDown;
