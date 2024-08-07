import { Navigate } from "react-router-dom";
import { useAuth } from "../store/Auth";
const Protected = ({ Component }) => {
    const {isLoggedIn} = useAuth();
    if(!isLoggedIn){
        return <Navigate to="/signin"/>
    }
    return (
        <>
            <Component />
        </>
    )
};
export default Protected;