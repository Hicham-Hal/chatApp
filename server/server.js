import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { connectDb } from './lib/db.js'
import messageRoute from './routes/message.js'
import userRoute from './routes/user.js'

dotenv.config()

// Create express and http server
const app = express()
const server = http.createServer(app)

//Initialize socket.io server
export const io = new Server(server, {
    cors: {origin: '*'}
})

//Store online users
export const userSocketMap = {} // {userId: socketId}

//Socket.io connection handler
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('User Connected', userId)

    if(userId) userSocketMap[userId] = socket.id;

    //Emit online user to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', ()=>{
        console.log('User disconnected', userId);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
})

// Middleware setup

app.use(express.json({limit: "4mb"}))
app.use(cors())


app.use("/api/status", (req, res) => res.send('Server is live'))
app.use('/api/user', userRoute)
app.use('/api/messages', messageRoute)

//Connect to Mongoose

await connectDb()


if(process.env.NODE_ENV !== 'production'){
    const PORT = process.env.PORTA || 5000;
    server.listen(PORT, () => {
        console.log('Server is running on PORT: ' + PORT)
    })
}

//Exporting for vercel
export default server;