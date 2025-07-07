import axios from 'axios';
import { createContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendUrl

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [authUser, setAuthUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null)

    //check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async() => {
        try{
            const {data} = await axios.get('/api/user/check')
            if(data.succuss){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        }catch(err){
            toast.error(err.message)
        }
    }

    //Connect socket function to handle socket connection and online users update
    const connectSocket = (userData) => {
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket)

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        })
    }

    //Login function to handle user authentication and socket connection
    const login = async(state, credentials) => {
        try{
            const { data } = await axios.post(`/api/user/${state}`, credentials);
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token)
                localStorage.setItem('token', data.token)
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        }catch(err){
            toast.error(err.message)
        }
    }

    //Logout function to handle user logout and socket disconnection
    const logout = async() => {
        try{
            localStorage.removeItem('token')
            setToken(null)
            setAuthUser(null)
            setOnlineUsers([])
            axios.defaults.headers.common['token'] = null
            toast.success('Logged out successfully')
            socket.disconnect()
        }catch(err){
            toast.error(err.message)
        }
    }

    //Update profile function to handle user profile updates
    const updateProfile = async(credentials) => {
        try{
            const { data } = await axios.put('/api/user/update-profile', credentials)
            if(data.success){
                setAuthUser(data.user)
                toast.success('Profile updated successfully')
            }
        }catch(err){
            toast.error(err.message)
        }
    }

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['token'] = token
        }
        checkAuth()
    }, [])

    const value = {
        axios,
        token,
        authUser,
        onlineUsers,
        socket,
        login,
        updateProfile,
        logout,
    }
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}