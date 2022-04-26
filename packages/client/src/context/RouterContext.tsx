import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSessionStorage } from "../hooks/useSessionStorage";


export const RouterContext = React.createContext({
  to: "",
  from: "",
});


const RouterProvider: React.FC = ({ children }) => {
  const location = useLocation()
  const [route, setRoute] = useSessionStorage("routes", {
    to: location.pathname,
    from: location.pathname
  });

  useEffect(() => {
    setRoute((prev: {
      to: string;
      from: string
    }) => ({ to: location.pathname, from: prev.to }))
  }, [location]);

  return <RouterContext.Provider value={route}>
    {children}
  </RouterContext.Provider>
}

export default RouterProvider;