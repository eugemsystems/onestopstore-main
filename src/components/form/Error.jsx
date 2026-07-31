import React from "react";

const Error = ({ errorMessage, errorName }) => {
  return (
    <>
      <span className="text-red-400 text-sm mt-2">
        {errorName || errorMessage?.message}
      </span>
    </>
  );
};

export default Error;
