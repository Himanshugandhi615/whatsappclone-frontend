import React from 'react'
import {BrowserRouter,Routes,Route } from "react-router-dom"
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import Home from './components/Home'
import SignOut from './components/SignOut';
import Protected from './components/Protected'
const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
         <Route exact path="/signup" element={<SignUp/>}/>
         <Route exact path="/signin" element={<SignIn/>}/>
         <Route path="/signout" element={<SignOut/>} />
         <Route exact path="/" element={<Protected Component={Home}/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;