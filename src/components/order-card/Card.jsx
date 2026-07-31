import React from "react";

const Card = ({ title, Icon, quantity, className }) => {
  return (
    <div className="flex h-full">
      <div className="flex items-center border border-border w-full rounded-xl p-5 bg-muted/30">
        <div
          className={`flex items-center justify-center p-3 rounded-full h-12 w-12 text-xl text-center mr-4 ${className}`}
        >
          <Icon />
        </div>
        <div>
          <h5 className="leading-none mb-2 text-base font-medium text-muted-foreground">
            {title}
          </h5>
          <p className="text-xl font-bold leading-none text-foreground">
            {quantity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
