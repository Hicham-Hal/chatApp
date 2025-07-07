import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import { MessageContext } from "../../context/MessageContext"
import assets from "../assets/assets"

const RightSidebar = () => {
    const {selectedUser, setSelectedUser, messages} = useContext(MessageContext)
    const {onlineUsers} = useContext(AuthContext)
    const {logout} = useContext(AuthContext)
    const [msgUrls, setMsgUrls] = useState()

    //Get all the images from the messages and set them to state
    useEffect(() => {
        setMsgUrls(() => {
            return messages.filter(msg => msg.image).map(msg => msg.image)
        })
    }, [messages])
    console.log(messages.filter(msg => msg.image).map(msg => msg.image))
    console.log(msgUrls)

    return selectedUser && (
        <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll
        ${selectedUser ? 'max-md:hidden' : ''}`}>
            <div className="pt-16 mt-2 flex flex-col gap-2 items-center text-xs font-light mx-auto">
                <img src={selectedUser?.profilePic || assets.avatar_icon} alt=""
                className="w-20 aspect-[1/1] rounded-full"/>
                <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
                    {onlineUsers.includes(selectedUser._id) && <p className="w-2 aspect-[1/1] bg-green-500"></p>}
                    {selectedUser.fullName}
                </h1>
                <p className="px-10 mx-auto">{selectedUser.bio}</p>
            </div>
            <hr className="border-[#ffffff] my-4"/>
            <div className="px-5 text-xs">
                <p>Media</p>
                <div className="mt-2 mb-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
                    {msgUrls.map((img, index) => (
                        <div key={index} onClick={() => window.open(img)}
                        className="cursor-pointer rounded">
                            <img src={img} alt="" className="h-full rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={() => {logout; setSelectedUser(null)}} className="absolute top-5 left-1/2 transform -translate-x-1/2
            bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none
            text-sm font-light py-2 px-20 rounded-full cursor-pointer">
                Logout
            </button>
        </div>
    )
}

export default RightSidebar