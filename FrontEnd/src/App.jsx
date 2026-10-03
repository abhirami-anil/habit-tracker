import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Register from './User/register'
import Login from './User/login'
import Profile from './User/profile'
import Home from './User/home'
import AdminRegister from './Admin/AdminRegister'
import AdminLogin from './Admin/AdminLogin'
import AdminProfile from './Admin/AdminProfile'
import AdminHome from './Admin/AdminHome'
import Frontpage from './FrontPage'

 
function App() {
  return (
    <div>
      
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Frontpage />} />
        <Route path='/home' element={<Home/>}/>
        <Route path='/register' element={<Register/>} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path="/adminRegister" element={<AdminRegister />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/adminProfile" element={<AdminProfile />}/>
        <Route path="/adminHome" element={<AdminHome />} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App