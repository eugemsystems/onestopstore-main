"use client";

import { Input } from "@components/ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { searchProducts } from "@lib/actions/product.actions";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SUGGESTION_LIMIT = 5;

const SearchInput = ({ variant = "default" }) => {
  const router = useRouter();
  const { formatPrice, showingTranslateValue } = useUtilsFunction();
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const requestId = useRef(0);

  useEffect(() => {
    const query = searchText.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const currentRequest = ++requestId.current;
    const timer = setTimeout(async () => {
      const { products } = await searchProducts({ query, limit: SUGGESTION_LIMIT });
      if (requestId.current === currentRequest) {
        setSuggestions(products || []);
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToResults = (query) => {
    setOpen(false);
    if (query) {
      router.push(`/search?query=${encodeURIComponent(query)}`, { scroll: true });
    } else {
      router.push(`/`, { scroll: true });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToResults(searchText.trim());
  };

  const isElectronic = variant === "electronic";
  const showDropdown = open && searchText.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        onSubmit={handleSearch}
        className={`relative overflow-hidden w-full ${
          isElectronic
            ? "flex bg-primary-foreground rounded-full p-1"
            : "pr-12 md:pr-14 shadow-sm rounded-md bg-background"
        }`}
      >
        <label
          className={`flex items-center ${isElectronic ? "w-full" : "py-0.5"}`}
        >
          <Input
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setOpen(true)}
            value={searchText}
            autoComplete="off"
            className={`form-input w-full appearance-none transition ease-in-out text-sm font-sans focus:ring-0 outline-none border-none focus:outline-none ${
              isElectronic
                ? "pl-5 h-9 bg-transparent focus:bg-transparent text-foreground placeholder:text-muted-foreground rounded-l-full"
                : "pl-5 h-9 rounded-md bg-background text-muted-foreground"
            }`}
            placeholder="Search for products (e.g. shirt, pant)"
          />
        </label>
        <button
          aria-label="Search"
          type="submit"
          className={`outline-none flex items-center justify-center transition duration-200 ease-in-out focus:outline-none ${
            isElectronic
              ? "w-9 h-9 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 shrink-0"
              : "absolute top-0 right-0 end-0 w-12 md:w-14 h-full text-xl text-muted-foreground hover:text-foreground"
          }`}
        >
          <MagnifyingGlassIcon
            className={`h-5 w-5 ${isElectronic && "stroke-2"}`}
            aria-hidden="true"
          />
        </button>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Searching…
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <ul className="max-h-96 overflow-y-auto">
                {suggestions.map((product) => (
                  <li key={product._id}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted"
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-border">
                        <Image
                          src={product.image?.[0]}
                          alt="product"
                          fill
                          className="object-contain p-1"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-foreground">
                          {showingTranslateValue(product.title)}
                        </p>
                        <p className="text-xs font-semibold text-primary">
                          {formatPrice(product.prices?.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => goToResults(searchText.trim())}
                className="block w-full border-t border-border px-4 py-2.5 text-center text-sm font-semibold text-primary hover:bg-muted"
              >
                Show all results for &ldquo;{searchText.trim()}&rdquo;
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No products found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
