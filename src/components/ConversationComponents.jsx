import styled from "styled-components";
import { SearchContainer, SearchInput } from "./ContactListComponents";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../store/Auth";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import ReactScrollToBottom from "react-scroll-to-bottom";
import EmojiPicker from 'emoji-picker-react';
import { RiArrowDropDownLine } from "react-icons/ri";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoSearch } from "react-icons/io5";
import { GrAttachment } from "react-icons/gr";
import { MdDownload } from "react-icons/md";
import { FaVideo } from "react-icons/fa6";
import { AiOutlineAudio } from "react-icons/ai";
import { AiOutlineAudioMuted } from "react-icons/ai";
import ting from "../assets/whatsapp_message.mp3";
import { ReactMediaRecorder } from "react-media-recorder";
import { base_url, image_url } from "../helper/constant";
import EmojiComponent from "./EmojiComponent";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 2;
  background: #f6f7f8;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between; 
  background: #ededed;
  padding: 11px;
  align-items: center;
  gap: 10px;
`;

const ProfileImage = styled.img`
width: 40px;
height: 40px;
border-radius: 50%;
cursor:pointer
`;

const ChatBox = styled.div`
  display: flex;
  background: #f0f0f0;
  padding: 10px;
  align-items: center;
  margin-top: auto; 
`;


const MessageContainer = styled.div`
display: flex;
flex-direction: column;
height: 100%;
background: #e5ddd6;
overflow: auto;
`;

const MessageDiv = styled.div`
justify-content: ${(props) => (props.isYours ? 'flex-end' : 'flex-start')};
display:flex;
margin: 5px 16px;
`;

const Message = styled.div`
background: ${(props) => (props.isYours ? "#daf8cb" : "white")};
max-width:50%;
color: #303030;
padding: 8px 50px 10px 10px;
font-size: 19px;
word-break:break-all;
border-radius:10px;
display:flex;
position:relative
`;

const NoChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #f6f7f8;
`;

const DownloadSection = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const Heading = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
`;

const DownloadButton = styled.button`
  background: #2ecc71;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #45a049;
  }
`;

const EncryptionNote = styled.p`
  font-size: 14px;
  color: #888;
  margin-top: 20px;
`;

const MediaContainer = styled.div`
    position:relative;    
    background: ${(props) => (props.isYours ? "#daf8cb" : "white")};
    border-radius:20px;
`;

const PdfContainer = styled.div`
    display: flex;
    height: 130px;
    width: 350px;
    border-radius: 10px;
    background: ${(props) => (props.isYours ? "#daf8cb" : "white")};
`;

const ImageContainer = styled.img`
    height: 350px;
    width: 300px;
    border:${(props) => (props.isYours ? "5px solid #daf8cb" : "5px solid white")}; 
    border-radius: 10px;
`;

const VideoContainer = styled.video`
    height: 350px;  
    width: 300px;
    border:${(props) => (props.isYours ? "5px solid #daf8cb" : "5px solid white")}; 
    border-radius: 10px;
`;

const ConversationComponent = ({ socket }) => {
    const messagetone = new Audio(ting);
    const { user, authorizationToken, activeUsers, dynamicUser, setMessageFlag } = useAuth();
    const [message, setMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [file, setFile] = useState();
    const [incommingMessage, setIncommingMessage] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const [recording, setRecording] = useState(false);

    const handleStopRecording = async (mediaBlobUrl) => {
        setRecording(false);
        try {
            const res = await fetch(mediaBlobUrl);
            const blob = await res.blob();
            const audioFile = new File([blob], 'recorded_audio.mp3', { type: 'audio/mpeg' });
            const formData = new FormData();
            formData.append("sender_id", user._id);
            formData.append("receiver_id", dynamicUser._id);
            formData.append("type", "file");
            formData.append("file", audioFile);
            const response = await axios.post(`${base_url}/save-chat`, formData, {
                headers: {
                    Authorization: authorizationToken
                }
            });
            const result = response.data;
            if (response.status === 200) {
                setMessage("");
                setMessageList((prev) => [...prev, result.chat]);
                setMessageFlag(result.chat);
                socket.emit("newMessage", result.chat);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage(e.target.files[0].name);
    }
    const formatDate = (date) => {
        const hours = new Date(date).getHours();
        const minutes = new Date(date).getMinutes();
        return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`
    }
    const downloadMedia = async (e, imageUrl) => {
        e.preventDefault();
        try {
            const response = await fetch(imageUrl);
            // Convert Response to Blob: The blob() method of the Response object is called to convert the response body into a Blob object, which represents raw binary data.
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            const namesplit = imageUrl.split("/");
            const name = namesplit.pop();
            anchor.download = name;
            anchor.click();
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    }
    const handleDeleteMessage = async (id) => {
        try {
            const response = await axios.get(`${base_url}/deletechat/${id}`, {
                headers: {
                    Authorization: authorizationToken
                }
            });
            const result = response.data;
            if (response.status === 200) {
                const data = messageList.filter((message) => message._id !== result.chat._id);
                setMessageList(data);
                setMessageFlag(data);
                socket.emit("deleteMessage", result.chat);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSend = async () => {
        try {
            if (message === "") {
                return;
            }
            let messagedata;
            if (file) {
                const data = new FormData();
                data.append("file", file);
                data.append("sender_id", user._id);
                data.append("receiver_id", dynamicUser._id);
                data.append("type", "file");
                messagedata = data;
            }
            else {
                messagedata = {
                    sender_id: user._id,
                    receiver_id: dynamicUser._id,
                    message: message
                }
            }
            const response = await axios.post(`${base_url}/save-chat`, messagedata, {
                headers: {
                    Authorization: authorizationToken
                }
            });
            const result = response.data;
            if (response.status === 200) {
                setMessage("");
                setFile("");
                setMessageList((prev) => [...prev, result.chat]);
                setMessageFlag(result.chat);
                socket.emit("newMessage", result.chat);

            }
        } catch (error) {
            console.log(error);
        }
    }
    const handleKeyPress = async (e) => {
        if (e.key === "Enter") {
            if (message === "") {
                return;
            }
            let messagedata;
            if (file) {
                const data = new FormData();
                data.append("file", file);
                data.append("sender_id", user._id);
                data.append("receiver_id", dynamicUser._id);
                data.append("type", "file");
                messagedata = data;
            }
            else {
                messagedata = {
                    sender_id: user._id,
                    receiver_id: dynamicUser._id,
                    message: message
                }
            }
            try {
                const response = await axios.post(`${base_url}/save-chat`, messagedata, {
                    headers: {
                        Authorization: authorizationToken
                    }
                });
                const result = response.data;
                if (response.status === 200) {
                    setMessage("");
                    setFile("");
                    setMessageList((prev) => [...prev, result.chat]);
                    setMessageFlag(result.chat)
                    socket.emit("newMessage", result.chat);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    const getExistsChats = async () => {
        try {
            const response = await axios.get(`${base_url}/getexistschats/${dynamicUser._id}`, {
                headers: {
                    Authorization: authorizationToken
                }
            });
            const result = response.data;
            if (response.status === 200) {
                setMessageList(result.chats);
            }
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        getExistsChats();
    }, [dynamicUser._id])

    useEffect(() => {
        socket.on("receiveNewMessage", (data) => {
            if (data) {
                setIncommingMessage(data);
                setMessageFlag(data);
                if (messagetone.paused) {
                    messagetone.play().catch(error => {
                        console.error('Error playing audio:', error);
                    });
                }
            }
        })
        socket.on("receiveDeleteMessage", (data) => {
            setDeleteMessage({ ...data, createdAt: Date.now() });
            setMessageFlag({ ...data, createdAt: Date.now() });
        })
    }, [])
    useEffect(() => {
        incommingMessage && dynamicUser?._id === incommingMessage.sender_id && setMessageList((prev) => [...prev, incommingMessage]);
    }, [incommingMessage]);

    useEffect(() => {
        deleteMessage && dynamicUser?._id === deleteMessage.sender_id && setMessageList((prev) => prev.filter((message) => message._id !== deleteMessage._id));
    }, [deleteMessage]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [handleKeyPress]);
    return (
        <>
            {
                dynamicUser._id ? <Container>
                    <ProfileHeader>
                        <div className="d-flex">
                            <ProfileImage src={dynamicUser.image !== "" ? `${image_url}/profileuploads/${dynamicUser.image}` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} />
                            <div className="ms-3" style={{ display: "flex", flexDirection: "column" }}>
                                <div>
                                    {dynamicUser.username}
                                </div>
                                <div>
                                    {
                                        activeUsers?.find((user => user._id === dynamicUser._id)) ? "Online" : "Offline"
                                    }
                                </div>
                            </div>
                        </div>
                        <div>
                            <FaVideo className="fs-4 me-4" style={{ cursor: "pointer" }} />
                            <IoSearch className="fs-4 me-4" style={{ cursor: "pointer" }} />
                            <BsThreeDotsVertical className="fs-4 me-2" style={{ cursor: "pointer" }} />
                        </div>
                    </ProfileHeader>
                    <MessageContainer style={{ backgroundImage: 'url("https://i.pinimg.com/564x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")' }}>
                        <ReactScrollToBottom className="h-100 w-100">
                            {
                                messageList.map((messageData, index) => (
                                    <MessageDiv key={index} isYours={messageData.sender_id === user._id}>
                                        {
                                            messageData.type === "text" ?
                                                <Message isYours={messageData.sender_id === user._id} >
                                                    <div>
                                                        {messageData.message}
                                                    </div>
                                                    <div style={{ position: "absolute", bottom: 5, right: 15, fontSize: "10px", color: "#919191", wordBreak: "keep-all" }}>
                                                        {formatDate(messageData.createdAt)}
                                                    </div>
                                                    <div style={{ position: "absolute", top: 0, right: 7 }}>
                                                        {messageData.sender_id === user._id && <RiArrowDropDownLine className="text-dark dropdown-toggle fs-4" style={{ cursor: "pointer" }} id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false" />}
                                                        <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
                                                            <li><button className="dropdown-item" onClick={() => { handleDeleteMessage(messageData._id) }}>Delete</button></li>
                                                        </ul>
                                                    </div>
                                                </Message> :
                                                <MediaContainer isYours={messageData.sender_id === user._id}>
                                                    {messageData.message.includes(".pdf") ? (
                                                        <PdfContainer isYours={messageData.sender_id === user._id}>
                                                            <img src="https://cdn.pixabay.com/photo/2017/03/08/21/20/pdf-2127829_1280.png" alt="pdf" style={{ height: "130px", width: "120px" }} />
                                                            <p style={{ wordBreak: "break-word" }}>{messageData.message}</p>
                                                        </PdfContainer>
                                                    ) : (
                                                        messageData.message.includes(".mp4") ? (
                                                            <VideoContainer src={`${image_url}/chatuploads/${messageData.message}`} type="video/mp4" controls isYours={messageData.sender_id === user._id}></VideoContainer>
                                                        ) : (
                                                            messageData.message.includes(".mp3") ? (
                                                                <audio className="audiostyle" controls>
                                                                    <source src={`${image_url}/chatuploads/${messageData.message}`} type="audio/mp3" />
                                                                </audio>
                                                            ) : (
                                                                <ImageContainer src={`${image_url}/chatuploads/${messageData.message}`} alt="image" isYours={messageData.sender_id === user._id} />
                                                            )
                                                        )
                                                    )}
                                                    <div style={{ position: "absolute", top: 0, right: 7 }}>
                                                        {messageData.sender_id === user._id && <RiArrowDropDownLine className="text-dark dropdown-toggle fs-4" style={{ cursor: "pointer" }} id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false" />}
                                                        <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
                                                            <li><button className="dropdown-item" onClick={() => { handleDeleteMessage(messageData._id) }}>Delete</button></li>
                                                        </ul>
                                                    </div>
                                                    <div style={{ position: "absolute", bottom: 5, right: 15, fontSize: "10px", color: "#919191", wordBreak: "keep-all" }}>
                                                        {formatDate(messageData.createdAt)}
                                                    </div>
                                                    <div>
                                                        {
                                                            !messageData.message.includes(".mp3") && !messageData.message.includes(".mp4") && <MdDownload onClick={(e) => downloadMedia(e, `${image_url}/chatuploads/${messageData.message}`)} className="fs-2" style={{ position: "absolute", bottom: 14, right: 50, marginRight: "10", border: "1px solid grey", borderRadius: "50%", cursor: "pointer" }} />
                                                        }
                                                    </div>
                                                </MediaContainer>
                                        }
                                    </MessageDiv>
                                ))
                            }
                        </ReactScrollToBottom>
                    </MessageContainer>
                    <ChatBox>
                        <SearchContainer>
                            <EmojiComponent setMessage={setMessage} />
                            <input type="file" id="fileInput" style={{ display: "none" }} onChange={handleFileChange} />
                            <label htmlFor="fileInput">
                                <GrAttachment className="fs-3 ms-3" style={{ opacity: "0.4", cursor: "pointer" }} />
                            </label>
                            <SearchInput placeholder="Type a message" value={message} onChange={(e) => { setMessage(e.target.value) }} />
                        </SearchContainer>
                        {
                            message ? (
                                <button
                                    onClick={handleSend}
                                    style={{ padding: '10px', borderRadius: '5px', background: '#2ecc71', border: 'none', color: 'white', marginLeft: "15px" }}
                                >
                                    <IoSend className="fs-1" />
                                </button>
                            ) : (
                                <ReactMediaRecorder
                                    audio
                                    render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                                        <div>
                                            {!recording ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setRecording(true);
                                                            startRecording();
                                                        }}
                                                        style={{ padding: '10px', borderRadius: '5px', background: '#2ecc71', border: 'none', color: 'white', marginLeft: "15px" }}
                                                    >
                                                        <AiOutlineAudio className="fs-1" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={() => {
                                                    setRecording(false);
                                                    stopRecording();
                                                }} style={{ padding: '10px', borderRadius: '5px', background: '#e74c3c', border: 'none', color: 'white', marginLeft: "15px" }}><AiOutlineAudioMuted className="fs-1" /></button>
                                            )}
                                        </div>
                                    )}
                                    onStop={handleStopRecording}
                                />
                            )
                        }
                    </ChatBox>
                </Container> :
                    <Container>
                        <NoChatContainer>
                            <DownloadSection>
                                <Heading>Download WhatsApp for Windows</Heading>
                                <Description>
                                    Make calls, share your screen, and get a faster experience when you
                                    download the Windows app.
                                </Description>
                                <DownloadButton>Get the App</DownloadButton>
                            </DownloadSection>
                            <EncryptionNote>
                                Your personal messages are end-to-end encrypted.
                            </EncryptionNote>
                        </NoChatContainer>
                    </Container>
            }
        </>
    );
};
export default ConversationComponent;