import { useState } from "react";

// import io from "socket.io-client";

// Create a single socket instance
// const socket = io(process.env.NEXT_PUBLIC_API_SOCKET_URL);
// const socket = io("https://kachabazar-backend-theta.vercel.app");

const useNotification = () => {
  const [socket, setSocket] = useState(null);

  // console.log("socket", socket);

  // useEffect(() => {
  //   // setSocket(io(process.env.NEXT_PUBLIC_API_SOCKET_URL));
  //   setSocket(io("http://localhost:5055"));
  // }, []);

  return {
    socket, // You can still return the socket instance if needed
  };
};

export default useNotification;
