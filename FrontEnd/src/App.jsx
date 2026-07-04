import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Register from './User/register'
import Login from './User/login'
import Profile from './User/profile'
import Home from './User/home'
 
function App() {
  return (
    <div>
      
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/register' element={<Register/>} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<Profile/>}/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App