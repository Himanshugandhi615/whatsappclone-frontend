import styled from "styled-components";
import { useAuth } from "../store/Auth";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { IoSearchOutline } from "react-icons/io5";
import { FaArrowLeft } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { MdOutlineMessage } from "react-icons/md";
import { TbHistoryToggle } from "react-icons/tb";
import { toast } from 'react-toastify';
import { PiUploadSimpleBold } from "react-icons/pi";
import { FaEye } from "react-icons/fa";
import Stories from 'react-insta-stories';
import ContactList from "./ContactList";
import ContactChat from "./ContactChat";
import GroupContactList from "./GroupContactList";
import { FaArrowRight } from "react-icons/fa";
import { MdPhotoCamera } from "react-icons/md";
import { base_url, image_url } from "../helper/constant";

const Container = styled.div`
display:flex;
flex-direction: column;
height:100%;
width: 100%;
flex:0.8;
`;
const ProfileInfoDiv = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
background: #ededed;
padding: 15px;
`;
const ProfileImage = styled.img`
 width: 40px;
 height: 40px;
 border-radius: 50%;
 cursor:pointer
 `;
const SearchBox = styled.div`
display: flex;
background: #f6f6f6;
padding:10px ;
`;
export const SearchContainer = styled.div`
display: flex;
flex-direction: row;
background: white;
border-radius: 16px;
width: 100%;
padding: 20px 0;
`;
export const SearchInput = styled.input`
width: 100%;
outline: none;
border: none;
padding-left: 15px;
font-size: 17px;
margin-left: 10px;
`;
export const ContactItem = styled.div`
    display: flex;
    flex-direction : row;
    border-bottom: 1px solid #f2f2f2;
    background: white;
    cursor: pointer;
    padding: 15px 12px;
`;

export const ProfileIcon = styled(ProfileImage)` 
width: 38px;
height: 38px;
`;
export const ContactName = styled.span`
width: 100%;
font-size: 16px;
color:black;
`;

export const ContactInfo = styled.div`
display: flex;
flex-direction: column;
width: 100%;
margin: 0 19px;
`;

const ContactListContainer = styled.div`
    overflow: auto;
`;

const ContactChatContainer = styled.div`
     overflow: auto;
`;

const MyStatusContainer = styled.div`
    display: flex;
    flex-direction : row;
    cursor: pointer;
    padding: 13px 10px;
`;

const MyStoryContainer = styled.div`
    cursor: pointer;
    padding: 13px 10px;
    display:flex;
    justify-content:space-between
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const StoryContainer = styled.div`
    position: relative;
    max-width: 90%;
    height: 100vh;
    background-color: black;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
`;

const Loader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: white;
    font-size: 20px;
`;

const ContactListComponent = ({ socket }) => {
    const [contactList, setContactList] = useState([]);
    const [file, setFile] = useState(null);
    const [userCredentials, setUserCredentials] = useState({ username: "", about: "" });
    const [userData, setUserData] = useState(true);
    const { authorizationToken, user, setUser, groupMember } = useAuth();
    const imageRef = useRef();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredContactList, setFilteredContactList] = useState([]);
    const [currentStories, setCurrentStories] = useState(null);
    const [storyFile, setStoryFile] = useState(null);
    const [myStory, setMyStory] = useState({});
    const [allStories, setAllStories] = useState([]);
    const [newStoryFlag, setNewStoryFlag] = useState({});
    const [newProfileChangeFlag, setNewProfileChangeFlag] = useState({});
    const [see, setSee] = useState(false);
    const [myStroyFlag, setMyStoryFlag] = useState({});
    const [groupName, setGroupName] = useState("");
    const formatDate = (date) => {
        const hours = new Date(date).getHours();
        const minutes = new Date(date).getMinutes();
        return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes} ${hours < 12 ? "AM" : "PM"}`
    }

    const handleContactClick = (user) => {
        let stories = user?.content?.map((content) => {
            if (content?.content?.includes(".mp4")) {
                return {
                    url: `${image_url}/storyuploads/${content?.content}`,
                    duration: 30000,
                    header: {
                        heading: user?.username,
                        subheading: `Posted ${formatDate(content?.createdAt)}`,
                        profileImage: `${image_url}/profileuploads/${user?.image}`,
                    },
                    type: 'video'
                };
            } else {
                return {
                    url: `${image_url}/storyuploads/${content?.content}`,
                    duration: 5000,
                    header: {
                        heading: user?.username,
                        subheading: `Posted ${formatDate(content?.createdAt)}`,
                        profileImage: `${image_url}/profileuploads/${user?.image}`,
                    }
                };
            }
        });
        setCurrentStories(stories);
    };

    if (userData && user) {
        setUserCredentials({
            username: user.username,
            about: user.about
        })
        setUserData(false);
    }
    const handleImage = (e) => {
        e.preventDefault();
        imageRef.current.click()
    }
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserCredentials({ ...userCredentials, [name]: value });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let formData = new FormData();
            formData.append('file', file);
            formData.append('username', userCredentials.username);
            formData.append('about', userCredentials.about);
            console.log(formData);
            const response = await axios.patch(`${base_url}/edituserprofile`, formData, {
                headers: {
                    Authorization: authorizationToken
                }
            });
            const result = response.data;
            if (response.status === 200) {
                toast.success(result.message);
                setUser(result.updateduser);
                socket.emit("profileChange", result.updateduser);
            }
        } catch (err) {
            console.log(err);
        }
    }
    const handleDeleteImage = async () => {
        try {
            const response = await axios.delete(`${base_url}/deleteprofileimage`, {
                headers: {
                    Authorization: authorizationToken
                }
            });
            const result = response.data;
            if (response.status === 200) {
                toast.success(result.message);
                setUser(result.updateduser);
                socket.emit("profileChange", result.updateduser);
            }
        } catch (error) {
            console.log(error);
        }
    }
    const getContactList = async () => {
        try {
            const response = await axios.get(`${base_url}/getcontactlist`, {
                headers: {
                    Authorization: authorizationToken,
                },
            });
            const result = response.data;
            if (response.status === 200) {
                setContactList(result.contactlist);
                setFilteredContactList(result.contactlist);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleUploadStory = async (e) => {
        try {
            if (!storyFile) {
                return
            }
            let formData = new FormData();
            formData.append('file', storyFile);
            const response = await axios.post(`${base_url}/uploadstory`, formData, {
                headers: {
                    Authorization: authorizationToken
                }
            });
            const result = response.data;
            if (response.status === 200) {
                toast.success(result.message);
                setMyStoryFlag(result.story);
                socket.emit("Story", result.story);
            }
        } catch (error) {
            console.log(error)
        }
    }
    const handleStoryDelete = async (id) => {
        try {
            const response = await axios.delete(`${base_url}/deletestory/${id}`, {
                headers: {
                    Authorization: authorizationToken,
                },
            });
            const result = response.data;
            if (response.status === 200) {
                toast.success(result.message)
                setMyStoryFlag(result.story);
                socket.emit("Story", result.story);
            }
        } catch (error) {
            console.log(error);
        }
    }
    const getAllStories = async () => {
        try {
            const response = await axios.get(`${base_url}/getallstories`, {
                headers: {
                    Authorization: authorizationToken,
                },
            });
            const result = response.data;
            if (response.status === 200) {
                setAllStories(result.allstories);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const getMyStory = async () => {
        try {
            const response = await axios.get(`${base_url}/getstory`, {
                headers: {
                    Authorization: authorizationToken
                }
            })
            const result = response.data;
            if (response.status === 200) {
                setMyStory(result.story);
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        getMyStory();
    }, [myStroyFlag])
    useEffect(() => {
        getContactList();
        getAllStories();
    }, [newProfileChangeFlag, newStoryFlag]);
    useEffect(() => {
        socket.on("receiveStory", (data) => {
            setNewStoryFlag(data);
        })
        socket.on("receiveProfileChange", (data) => {
            setNewProfileChangeFlag(data);
        })
    }, [])
    useEffect(() => {
        const filteredList = contactList.filter((userData) =>
            userData.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredContactList(filteredList);
    }, [searchQuery]);
    return (
        <Container>
            <ProfileInfoDiv>
                <ProfileImage src={user.image !== "" ? `${image_url}/profileuploads/${user?.image}` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample" />
                <div
                    className="offcanvas offcanvas-start"
                    tabIndex="-1"
                    id="offcanvasExample"
                    aria-labelledby="offcanvasExampleLabel"
                    style={{ width: '28.3%' }}
                >
                    <div className="offcanvas-header">
                        <h4 className="offcanvas-title text-dark d-flex" id="offcanvasExampleLabel">
                            <FaArrowLeft className="mt-2 me-3" data-bs-dismiss="offcanvas" aria-label="Close" style={{ cursor: "pointer" }} />
                            <div>Profile</div>
                        </h4>
                    </div>
                    <div className="offcanvas-body">
                        <div className='m-auto' style={{ width: "70%" }}>
                            <div style={{ textAlign: "center" }}>
                                <input type="file" name="image" ref={imageRef} hidden onChange={handleFileChange} />
                                <img
                                    src={user.image !== "" ? `${image_url}/profileuploads/${user.image}` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                    alt="Profile"
                                    data-bs-toggle="offcanvas"
                                    data-bs-target="#offcanvasExample"
                                    aria-controls="offcanvasExample"
                                    className="rounded-circle"
                                    style={{ width: '200px', height: '200px' }}
                                />
                                <div className='mt-2'>
                                    <button type="button" className="btn me-2" onClick={handleImage} style={{ background: '#2ecc71' }}><MdEdit className="fs-2 text-white" /></button>
                                    <button type="button" className="btn btn-danger" onClick={handleDeleteImage}><MdDelete className="fs-2" /></button>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label text-success">
                                        Your name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        name="username"
                                        value={userCredentials.username}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="about" className="form-label text-success">
                                        About
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="about"
                                        name="about"
                                        value={userCredentials.about}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="about" className="form-label text-success">
                                        Phone
                                    </label>
                                    <div>{user.phone}</div>
                                    <p style={{ color: "gray" }}>You can't change phone number</p>
                                </div>
                                <div className='mb-3' style={{ textAlign: "center" }}>
                                    <button type="submit" className="btn" style={{ background: '#2ecc71', color: "white" }}>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="dropdown mt-1">
                    <TbHistoryToggle className="text-dark fs-4 me-4" style={{ cursor: "pointer" }} data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample2" aria-controls="offcanvasExample" />
                    <div
                        className="offcanvas offcanvas-start"
                        tabIndex="-1"
                        id="offcanvasExample2"
                        aria-labelledby="offcanvasExampleLabel"
                        style={{ width: '28.3%' }}
                    >
                        {currentStories && (
                            <Overlay onClick={() => setCurrentStories(null)}>
                                <StoryContainer onClick={(e) => e.stopPropagation()}>
                                    <Stories stories={currentStories} defaultInterval={1500} isPaused="true" onAllStoriesEnd={() => setCurrentStories(null)} loader={<Loader>Loading...</Loader>} />
                                </StoryContainer>
                            </Overlay>
                        )}
                        <div className="d-flex flex-column">
                            <h4 className="offcanvas-title text-dark d-flex" id="offcanvasExampleLabel" style={{ height: "69px", padding: "12px 0px 0px 16px", background: "#ededed" }}>
                                <FaArrowLeft className="mt-2 me-3" style={{ cursor: "pointer" }} data-bs-dismiss="offcanvas" aria-label="Close" />
                                <div>Status</div>
                            </h4>
                            <div className="d-flex flex-row justify-content-between">
                                <div>
                                    <MyStatusContainer className="m-1" >
                                        <ProfileIcon src={user?.image !== "" ? `${image_url}/profileuploads/${user?.image}` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} onClick={() => { myStory && handleContactClick(myStory) }} />
                                        <input type="file" style={{ display: "none" }} id="status" onChange={(e) => { setStoryFile(e.target.files[0]) }} />
                                        <label htmlFor="status">
                                            <ContactInfo style={{ cursor: "pointer" }}>
                                                <h6 className="m-0">My Status</h6>
                                                <p className="m-0" style={{ color: "gray" }}>Tap to add status update</p>
                                            </ContactInfo>
                                        </label>
                                    </MyStatusContainer>
                                </div>
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    {
                                        myStory?._id && <FaEye className="fs-3" style={{ cursor: "pointer" }} onClick={() => { see ? setSee(false) : setSee(true) }} />
                                    }
                                </div>
                                <button className="btn" style={{ background: '#2ecc71', color: "white" }} onClick={handleUploadStory}><PiUploadSimpleBold className="fs-4" /></button>
                            </div>
                            <div>
                                {
                                    see && myStory && myStory?.content?.map((content) => {
                                        return (
                                            <MyStoryContainer className="m-1">
                                                <div className="d-flex w-100" onClick={() => { handleContactClick(myStory) }}>
                                                    <ProfileIcon src={content?.content?.includes("mp4") ? "https://w7.pngwing.com/pngs/147/745/png-transparent-video-production-freemake-video-er-video-icon-free-angle-text-rectangle-thumbnail.png" : "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png"} />
                                                    <input type="file" style={{ display: "none" }} id="status" onChange={(e) => { setStoryFile(e.target.files[0]) }} />
                                                    <ContactInfo style={{ cursor: "pointer" }}>
                                                        <h6 className="m-0">views</h6>
                                                        <p className="m-0" style={{ color: "gray" }}>{formatDate(content.createdAt)}</p>
                                                    </ContactInfo>
                                                </div>
                                                <div className="mt-1">
                                                    <BsThreeDotsVertical className="fs-5" id="dropdownMenu3" data-bs-toggle="dropdown" aria-expanded="false" />
                                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenu3">
                                                        <li><button className="dropdown-item" onClick={() => handleStoryDelete(content._id)}>Delete</button></li>
                                                    </ul>
                                                </div>
                                            </MyStoryContainer>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className="m-1" style={{ overflow: "auto" }}>
                            <p className="m-0" style={{ color: "gray" }}>Recent updates</p>
                            {allStories.map((user, index) => (
                                <ContactItem key={index} onClick={() => handleContactClick(user)} >
                                    <ProfileIcon src={user?.image !== "" ? `${image_url}/profileuploads/${user?.image}` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} />
                                    <ContactInfo>
                                        <ContactName>{user?.username}</ContactName>
                                        <p className="m-0">{user?.createdAt && formatDate(user?.createdAt)}</p>
                                    </ContactInfo>
                                </ContactItem>
                            ))}
                        </div>
                    </div>
                    <MdOutlineMessage className="text-dark fs-4 me-4" style={{ cursor: "pointer" }} data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample1" aria-controls="offcanvasExample" />
                    <div
                        className="offcanvas offcanvas-start"
                        tabIndex="-1"
                        id="offcanvasExample1"
                        aria-labelledby="offcanvasExampleLabel"
                        style={{ width: '28.3%' }}
                    >
                        <div className="d-flex flex-column" style={{ height: "170px" }}>
                            <h4 className="offcanvas-title text-dark d-flex" id="offcanvasExampleLabel" style={{ height: "69px", padding: "12px 0px 0px 16px", backgroundColor: "#ededed" }}>
                                <FaArrowLeft className="mt-2 me-3" style={{ cursor: "pointer" }} data-bs-dismiss="offcanvas" aria-label="Close" />
                                <div>New chat</div>
                            </h4>
                            <SearchBox>
                                <SearchContainer>
                                    <IoSearchOutline className="text-dark fs-5 ms-4 mt-1" />
                                    <SearchInput placeholder="Search or start new chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </SearchContainer>
                            </SearchBox>
                        </div>
                        <div className="offcanvas-body">
                            <ContactListContainer>
                                {filteredContactList.map((userData, index) => (
                                    <ContactList key={index} userData={userData} />
                                ))}
                            </ContactListContainer>
                        </div>
                    </div>
                    <BsThreeDotsVertical className="text-dark dropdown-toggle fs-4" style={{ cursor: "pointer" }} id="dropdownMenu2" data-bs-toggle="dropdown" aria-expanded="false" />
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
                        <li><button className="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample4" aria-controls="offcanvasExample">New Group</button></li>
                        <li><Link className="dropdown-item" to="/signout">Sign Out</Link></li>
                    </ul>
                    <div
                        className="offcanvas offcanvas-start"
                        tabIndex="-1"
                        id="offcanvasExample4"
                        aria-labelledby="offcanvasExampleLabel"
                        style={{ width: '28.3%' }}
                    >
                        <div className="d-flex flex-column" style={{ height: "140px" }}>
                            <h4 className="offcanvas-title text-dark d-flex" id="offcanvasExampleLabel" style={{ height: "69px", padding: "12px 0px 0px 16px", backgroundColor: "#ededed" }}>
                                <FaArrowLeft className="mt-2 me-3" style={{ cursor: "pointer" }} data-bs-dismiss="offcanvas" aria-label="Close" />
                                <div>New Group</div>
                            </h4>
                            <ContactItem>
                                <MdPhotoCamera className="fs-1" />
                                <ContactInfo>
                                    <input class="form-control" type="text" placeholder="Group name" value={groupName} onChange={(e) => { setGroupName(e.target.value) }} />
                                </ContactInfo>
                            </ContactItem>
                        </div>
                        <div className="offcanvas-body">
                            <ContactListContainer>
                                {filteredContactList?.map((userData, index) => (
                                    <GroupContactList key={index} userData={userData} />
                                ))}
                            </ContactListContainer>
                            {
                                groupMember?.length !== 0 && <div style={{ position: "absolute", bottom: 10, right: 10 }}>
                                    <button className="btn" style={{ background: '#2ecc71', color: "white" }} ><FaArrowRight /></button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </ProfileInfoDiv>
            <SearchBox>
                <SearchContainer>
                    <IoSearchOutline className="text-dark fs-5 ms-4 mt-1" />
                    <SearchInput placeholder="Search or start new chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </SearchContainer>
            </SearchBox>
            <ContactChatContainer>
                {filteredContactList.map((userData, index) => (
                    <ContactChat key={index} userData={userData} />
                ))}
            </ContactChatContainer>
        </Container>
    );
};

export default ContactListComponent;

