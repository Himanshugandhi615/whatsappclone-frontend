import React, { useState } from 'react';
import { ContactItem, ProfileIcon, ContactInfo, ContactName } from "./ContactListComponents";
import { useAuth } from '../store/Auth';
import {image_url} from "../helper/constant"

const GroupContactList = ({ userData }) => {
    const { setGroupMember } = useAuth();
    const [selected, setSelected] = useState(false);
    const handleClick = () => {
        if (selected) {
            setGroupMember(prev => prev.filter(id => id !== userData._id));
        } else {
            setGroupMember(prev => [...prev, userData._id]);
        }
        setSelected(prev => !prev);
    };
    return (
        <>
            {
                userData.type!=="group" && <ContactItem onClick={handleClick} style={{ backgroundColor: selected ? 'lightblue' : 'white' }}>
                    <ProfileIcon src={userData?.image !== "" ? `${image_url}/profileuploads/${userData?.image}` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} />
                    <ContactInfo>
                        <ContactName>{userData?.username}</ContactName>
                        <div>{userData?.about}</div>
                    </ContactInfo>
                </ContactItem>
            }
        </>
    );
};

export default GroupContactList;
