"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const fallbackImage =
  "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";

const ImageWithFallback = ({
  src,
  img,
  fallback = fallbackImage,
  alt = "image",
  fit = "cover",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <>
      {img ? (
        <img
          src={imgSrc}
          onError={() => setImgSrc(fallback)}
          alt={alt}
          {...props}
          className={`${fitClass} transition duration-150 ease-linear transform group-hover:scale-105 ${props.className || ""
            }`}
        />
      ) : (
        <Image
          src={imgSrc}
          onError={() => setImgSrc(fallback)}
          alt={alt}
          {...props}
          className={`${fitClass} transition duration-150 ease-linear transform group-hover:scale-105 ${props.className || ""
            }`}
        />
      )}
    </>
  );
};

export default ImageWithFallback;
