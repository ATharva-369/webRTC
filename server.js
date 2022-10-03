const express  = require('express');
const app = express();
const server = require('http').Server(app);
app.set('view engine','ejs');
app.use(express.static('public'));
const {v4:uuidv4} = require('uuid');
const io = require('socket.io')(server,{
    cors:{
        origin:'*'
    }
})
const {ExpressPeerServer} = require('peer');
const PeerServer = ExpressPeerServer(server,{debug : true});

app.use('/peerjs',PeerServer);
app.get('/',(req,res)=>{
    // res.status(200).send('Hello, World!');
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room',(req,res)=>{
    res.render('index',{roomID : req.params.room})
})
io.on('connection',(socket) => {
    socket.on('join-room',(roomID,userID,userName)=>{
        socket.join(roomID);
        io.to(roomID).emit('user-connected', userID);
        socket.on('message',(message)=>{       
            io.to(roomID).emit('createMessage',message,userName)
        } )
    })
})
server.listen(process.env.PORT || 3030)