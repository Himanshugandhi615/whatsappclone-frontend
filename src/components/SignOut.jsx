import { useEffect } from "react";
import { useAuth } from "../store/Auth";
import { Navigate } from "react-router-dom";
const SignOut = () => {
  const { LogoutUser } = useAuth();
  useEffect(() => {
    LogoutUser();
  }, [LogoutUser]);
  
  return <Navigate to="/signin" />;
};

export default SignOut;