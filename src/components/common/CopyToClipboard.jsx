import React from "react";

const CopyToClipboard = ({ text, onCopy, children }) => {
  const handleClick = async (event) => {
    let success = false;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    } catch {
      success = false;
    }

    if (onCopy) {
      onCopy(text, success);
    }

    // If child already has onClick, call it too
    if (children?.props?.onClick) {
      children.props.onClick(event);
    }
  };

  // Clone child and inject onClick
  return React.cloneElement(React.Children.only(children), {
    onClick: handleClick,
  });
};

export default CopyToClipboard;
