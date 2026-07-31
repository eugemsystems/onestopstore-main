import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export const NavigationButton = ({ onClick, disabled, directionIcon }) => {
  const ariaLabel = directionIcon === "prev" ? "Previous" : "Next";

  const Icon = directionIcon === "prev" ? FiChevronLeft : FiChevronRight;

  return (
    <button
      //   icon={icon}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="align-bottom inline-flex items-center justify-center cursor-pointer leading-5 transition-colors duration-150 font-medium p-2 rounded-md text-foreground dark:text-muted-foreground dark:hover:bg-accent focus:outline-none border border-transparent active:bg-transparent hover:bg-muted"
    >
      <Icon />
    </button>
  );
};

export const PageButton = function PageButton({ page, isActive, onClick }) {
  return (
    <button
      size="pagination"
      onClick={onClick}
      className={`${
        isActive
          ? "bg-primary text-primary-foreground font-normal hover:text-primary-foreground"
          : "text-foreground dark:text-muted-foreground"
      } align-bottom inline-flex items-center justify-center cursor-pointer leading-5 transition-colors duration-150 font-medium px-3 py-1 rounded-md text-xs text-muted-foreground focus:outline-none border border-transparent active:bg-transparent hover:bg-muted dark:hover:bg-accent`}
    >
      {page}
    </button>
  );
};

export const EmptyPageButton = () => <span className="px-2 py-1">...</span>;

const Pagination = React.forwardRef(function Pagination(props, ref) {
  const {
    totalResults,
    resultsPerPage = 10,
    label,
    onChange,
    ...other
  } = props;
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(1);

  const TOTAL_PAGES = Math.ceil(totalResults / resultsPerPage);
  const FIRST_PAGE = 1;
  const LAST_PAGE = TOTAL_PAGES;
  const MAX_VISIBLE_PAGES = 7;

  function handlePreviousClick() {
    setActivePage(activePage - 1);
  }

  function handleNextClick() {
    setActivePage(activePage + 1);
  }

  useEffect(() => {
    // [1], 2, 3, 4, 5, ..., 12 case #1
    // 1, [2], 3, 4, 5, ..., 12
    // 1, 2, [3], 4, 5, ..., 12
    // 1, 2, 3, [4], 5, ..., 12
    // 1, ..., 4, [5], 6, ..., 12 case #2
    // 1, ..., 5, [6], 7, ..., 12
    // 1, ..., 6, [7], 8, ..., 12
    // 1, ..., 7, [8], 9, ..., 12
    // 1, ..., 8, [9], 10, 11, 12 case #3
    // 1, ..., 8, 9, [10], 11, 12
    // 1, ..., 8, 9, 10, [11], 12
    // 1, ..., 8, 9, 10, 11, [12]
    // [1], 2, 3, 4, 5, ..., 8
    // always show first and last
    // max of 7 pages shown (incl. [...])
    if (TOTAL_PAGES <= MAX_VISIBLE_PAGES) {
      setPages(Array.from({ length: TOTAL_PAGES }).map((_, i) => i + 1));
    } else if (activePage < 5) {
      // #1 active page < 5 -> show first 5
      setPages([1, 2, 3, 4, 5, "...", TOTAL_PAGES]);
    } else if (activePage >= 5 && activePage < TOTAL_PAGES - 3) {
      // #2 active page >= 5 && < TOTAL_PAGES - 3
      setPages([
        1,
        "...",
        activePage - 1,
        activePage,
        activePage + 1,
        "...",
        TOTAL_PAGES,
      ]);
    } else {
      // #3 active page >= TOTAL_PAGES - 3 -> show last
      setPages([
        1,
        "...",
        TOTAL_PAGES - 4,
        TOTAL_PAGES - 3,
        TOTAL_PAGES - 2,
        TOTAL_PAGES - 1,
        TOTAL_PAGES,
      ]);
    }
  }, [activePage, TOTAL_PAGES]);

  useEffect(() => {
    onChange(activePage);
  }, [activePage]);

  return (
    <div className="mt-4 text-muted-foreground">
      <div
        className="flex flex-col justify-between text-xs sm:flex-row text-muted-foreground dark:text-muted-foreground"
        ref={ref}
        {...other}
      >
        {/*
         * This (label) should probably be an option, and not the default
         */}
        <span className="flex items-center font-semibold tracking-wide uppercase">
          Showing {activePage * resultsPerPage - resultsPerPage + 1}-
          {Math.min(activePage * resultsPerPage, totalResults)} of{" "}
          {totalResults}
        </span>

        <div className="flex mt-2 sm:mt-auto sm:justify-end font-normal text-xs">
          <nav aria-label={label}>
            <ul className="inline-flex items-center">
              <li>
                <NavigationButton
                  directionIcon="prev"
                  disabled={activePage === FIRST_PAGE}
                  onClick={handlePreviousClick}
                />
              </li>
              {pages.map((p, i) => (
                <li key={p.toString() + i}>
                  {p === "..." ? (
                    <EmptyPageButton />
                  ) : (
                    <PageButton
                      page={p}
                      isActive={p === activePage}
                      onClick={() => setActivePage(+p)}
                    />
                  )}
                </li>
              ))}
              <li>
                <NavigationButton
                  directionIcon="next"
                  disabled={activePage === LAST_PAGE}
                  onClick={handleNextClick}
                />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
});

export default Pagination;
