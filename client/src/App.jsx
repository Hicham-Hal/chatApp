import { useContext } from 'react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from "react-router-dom"
import { AuthContext } from '../context/AuthContext'
import { MessageContext } from '../context/MessageContext'
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import ProfilePage from "./pages/ProfilePage"

const App = () => {

  const { authUser } = useContext(AuthContext)
  const {users} = useContext(MessageContext)
  console.log(authUser, users)

  return (
    <div className="relative bg-[url('/bgImage.svg')] bg-cover bg-center bg-no-repeat ">
      <Toaster />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to={'/login'} />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={'/'} />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to={'/login'} />} />
      </Routes>
      <div className='absolute bottom-1 right-5'>
        <h3 className='text-base text-white'>#HH1</h3>
      </div>
    </div>
  )
}

export default App