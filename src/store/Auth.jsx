import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
export const AuthContext = createContext();
import { base_url } from "../helper/constant";

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState("");
  const authorizationToken =  `Bearer ${token}`;
  const [activeUsers,setActiveUsers] = useState([]);
  const [dynamicUser,setDynamicUser] = useState({});
  const [messageFlag,setMessageFlag] = useState({});
  const [groupMember,setGroupMember] = useState([]);

  //function to stored the token in local storage
  const storeTokenInLS = (serverToken) => {
    setToken(serverToken);
    localStorage.setItem("token", serverToken);
  };

  //if token nhi hai toh false set kr dega
  let isLoggedIn = !!token;

  //to check whether is loggedIn or not
  const LogoutUser = () => {
    setToken("");
    setUser("");
    setDynamicUser("");
    return localStorage.removeItem("token");
  };


  //JWT AUthentication - to get the currently loggedIn user data
  const userAuthentication = async () => {
    try {
      const response = await axios.get(`${base_url}/user`, {
        headers: {
          Authorization: authorizationToken
        }
      });
      const result = response.data;
      if (response.status === 200) {
        if (result.user) {
          setUser(result.user);
        } else {
          console.log(result.error);
        }
      }
    } catch (err) {
      console.log("Error fetching user data");
    }
  }
  useEffect(() => {
    userAuthentication();
  }, [token])

  return (
    <AuthContext.Provider value={{ isLoggedIn, storeTokenInLS, LogoutUser, user, setUser,token,authorizationToken,activeUsers,setActiveUsers,
    dynamicUser,setDynamicUser,messageFlag,setMessageFlag,groupMember,setGroupMember}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  //consumer
  const authContextValue = useContext(AuthContext);
  if (!authContextValue) {
    throw new Error("useAuth used outside of the Provider");
  }
  return authContextValue;
};