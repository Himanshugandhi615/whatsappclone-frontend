import React, { useEffect, useMemo, useState } from 'react'
import styled from "styled-components";
import { io } from "socket.io-client";
import { useAuth } from '../store/Auth';
import ContactListComponent from "./ContactListComponents";
import ConversationComponent from "./ConversationComponents";
import { url } from '../helper/constant';

const Container = styled.div`
display : flex;
flex-direction: row;
height: 100vh;
width: 100%;
background: #f8f9fb;
`;
const Home = () => {
  //state ka variable change krne pr socket.id same rhe 
  const socket = useMemo(() => io(`${url}`), []);
  const { user, setActiveUsers} = useAuth();
  useEffect(() => {
    socket.on("connect", () => {
      console.log("user connected");
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    socket.emit("addUser", user);
    socket.on("getUsers", users => {
      setActiveUsers(users);
    })
  }, [user])
  return (
    <Container>
      <ContactListComponent socket={socket} />
      <ConversationComponent socket={socket} />
    </Container>
  )
}

export default Home
