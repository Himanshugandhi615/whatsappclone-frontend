import { useAuth } from "../store/Auth";
import { ContactItem, ProfileIcon, ContactInfo, ContactName } from "./ContactListComponents";
import {image_url} from "../helper/constant";
const ContactList = ({ userData }) => {
    const { setDynamicUser } = useAuth();
    const getUser = () => {
        setDynamicUser(userData);
    }
    return (
        <>
            {
                userData.type!=="group" && <ContactItem onClick={getUser} data-bs-dismiss="offcanvas" aria-label="Close">
                <ProfileIcon src={userData.image !== "" ? `${image_url}/profileuploads/${userData.image}` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} />
                <ContactInfo>
                    <ContactName>{userData.username}</ContactName>
                    <div>{userData.about}</div>
                </ContactInfo>
            </ContactItem>
            }
        </>
    );
};

export default ContactList;