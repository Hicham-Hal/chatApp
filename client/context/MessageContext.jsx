import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const MessageContext = createContext()

export const MessageProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})

    const {socket, axios} = useContext(AuthContext)

    //Function to get all users for sidebar
    const getUsers = async() => {
        try{
            const {data} = await axios.get('/api/messages/getUsers')
            if(data.success){
                console.log('data',data)
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        }catch(err){
            toast.error(err.message)
        }
    }

    //Function to get messages for selected users

    const getMessages = async(userId) => {
        try{
            const { data } = await axios.get(`/api/messages/${userId}`)
            if(data.success){
                setMessages(data.messages)
            }
        }catch(err){
            toast.error(err.message)
        }
    }

    //Function to send a message to selected user
    const sendMessage = async(messageData) => {
        try{
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if(data.success){
                setMessages((prevMessages) => [...prevMessages, data.message])
            }
        }catch(err){
            toast.error(err.message)
        }
    }

    //Function to subscribe to messages for selected user
    const subscribeToMessages = async() => {
        try{
            if(!socket) return;

            socket.on('newMessage', (newMessage) => {
                if(selectedUser && newMessage.senderId === selectedUser._id){
                    newMessage.seen = true;
                    setMessages((prevMessages) => [...prevMessages, newMessage])
                    axios.put(`/api/messages/mark/${newMessage._id}`)
                }else{
                    setUnseenMessages((prevUnseenMessages) => ({
                        ...prevUnseenMessages, [newMessage.senderId] :
                        prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1
                        : 1
                    }))
                }
            })
        }catch(err){
            toast.error(err.message)
        }
    }

    //Function to unsubscribe from messages
    const unsubscribeMessages = () => {
        if(socket) socket.off('newMessage')
    }

    useEffect(()=>{
        subscribeToMessages()
        return ()=> unsubscribeMessages()
    }, [socket, selectedUser])


    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        getUsers,
        setMessages,
        sendMessage,
        setSelectedUser,
        getMessages,
        setUnseenMessages,
    }
    return(
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    )
}