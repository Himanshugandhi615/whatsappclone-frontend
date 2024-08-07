import { useState, useEffect } from "react";
import { useAuth } from "../store/Auth";
import styled from "styled-components";
import axios from "axios";
import { MdPhotoSizeSelectActual } from "react-icons/md";
import { FaVideo } from "react-icons/fa6";
import { FaFilePdf } from "react-icons/fa";
import { AiFillAudio } from "react-icons/ai";
import { ContactItem, ProfileIcon, ContactInfo, ContactName } from "./ContactListComponents";
import {base_url,image_url} from "../helper/constant"
const MessageText = styled.span`
width: 26%;
font-size: 14px;
margin-top: 3px;
color: rgba (0,0,0,0.8);
`;
const ContactChat = ({ userData }) => {
    const { setDynamicUser, authorizationToken, messageFlag } = useAuth();
    const [message, setMessage] = useState({});
    const getUser = () => {
        setDynamicUser(userData);
    }
    const formatDate = (date) => {
        const hours = new Date(date).getHours();
        const minutes = new Date(date).getMinutes();
        return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes} ${hours < 12 ? "AM" : "PM"}`
    }
    const getLastChat = async () => {
        try {
            const response = await axios.get(`${base_url}/getlastchat/${userData._id}`, {
                headers: {
                    Authorization: authorizationToken
                }
            });
            const result = response.data;
            if (response.status === 200) {
                setMessage(result.chat);
            }
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        getLastChat();
    }, [messageFlag])
    return (
        <>
            {
                message?._id && <ContactItem onClick={getUser}>
                    <ProfileIcon src={userData.image !== "" ? `${image_url}/profileuploads/${userData.image}` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} />
                    <ContactInfo>
                        <ContactName>{userData.username}</ContactName>
                        <div>{message?.type === "file" ?(message?.message?.includes("mp3")?(<AiFillAudio />):(message?.message?.includes("mp4")?(<FaVideo />):(message?.message?.includes("pdf")?(<FaFilePdf />):(<MdPhotoSizeSelectActual />)))): (message?.message?.substr(0,30))}</div>
                    </ContactInfo>
                    <MessageText>{message?.createdAt && formatDate(message?.createdAt)}</MessageText>
                </ContactItem>
            }
        </>
    );
};

export default ContactChat;