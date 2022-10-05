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

var nodeMailer  = require('nodemailer');
const Transporter = nodeMailer.createTransport({
    'port':465,
    'host' : 'smtp.gmail.com',
    'auth':{
        "user" : 'wedrtctest@gmail.com',
        'pass':'vcelnatajdjevzom'
    },
    'secure':true
});

app.get('/',(req,res)=>{
    // res.status(200).send('Hello, World!');
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room',(req,res)=>{
    res.render('index',{roomID : req.params.room})
})

app.post('/send-mail',(req,res)=>{
    const To = req.body.to;
    const URL = req.body.url;
    const MailData = {
        'from':'wedrtctest@gmail.com',
        'to':To,
        'subject':'Join the video chat with me!',
        'html':`<p>Hello please join the video chat on => ${URL}</p>`
    };
    Transporter.sendMail(MailData,(err,info)=>{
        if(err){
            console.log(err);
            res.status(404).send({message:err,message_id:info.messageId});
        }
        res.status(200).send({message:'Invitation Sent!',message_id:info.messageId});
    })
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