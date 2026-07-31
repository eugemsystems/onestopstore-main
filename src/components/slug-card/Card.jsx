"use client";

import React from "react";
import {
  FiDollarSign,
  FiHome,
  FiMapPin,
  FiRepeat,
  FiShieldOff,
  FiSun,
  FiTruck,
} from "react-icons/fi";

//internal import
import useUtilsFunction from "@hooks/useUtilsFunction";

const Card = ({ storeCustomization }) => {
  const { showingTranslateValue } = useUtilsFunction();
  const slug = storeCustomization?.slug;
  // config array (icon + corresponding description key)
  const items = [
    { icon: <FiTruck />, text: slug?.card_description_one },
    { icon: <FiHome />, text: slug?.card_description_two },
    { icon: <FiDollarSign />, text: slug?.card_description_three },
    { icon: <FiRepeat />, text: slug?.card_description_four },
    { icon: <FiShieldOff />, text: slug?.card_description_five },
    { icon: <FiSun />, text: slug?.card_description_six },
    { icon: <FiMapPin />, text: slug?.card_description_seven },
  ];
 return (
    <ul className="my-0">
      {items.map((item, index) => (
        <li key={index} className="flex items-center py-2">
          <span className="text-lg text-muted-foreground items-start mr-3">
            {item.icon}
          </span>
          <p className="font-sans leading-5 text-sm text-muted-foreground">
            {showingTranslateValue(item.text)}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default Card;
