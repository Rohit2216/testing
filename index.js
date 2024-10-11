const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');          // Import CORS
require('dotenv').config();  // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;
console.log(process.env.mongoUrl)
// Middleware to parse JSON
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Connect to MongoDB using environment variables
mongoose.connect(process.env.mongoUrl, {   // Make sure the environment variable is called MONGO_URL
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});


// Define a schema for the dynamic data (SenRa messages)
const messageSchema = new mongoose.Schema({
    ack: Boolean,
    appEui: String,
    channel: Number,
    datarate: Number,
    devClass: String,
    devEui: String,
    devProfile: String,
    devType: String,
    dup: Boolean,
    estLat: Number,
    estLng: Number,
    freq: Number,
    gwEui: String,
    gwRxTime: Date,
    ismBand: String,
    joinId: Number,
    maxPayload: Number,
    pdu: String,
    port: Number,
    rssi: Number,
    seqno: Number,
    snr: Number,
    txtime: Date
});

// Create a model for the schema
const Message = mongoose.model('Message', messageSchema);

// ========================================
// CRUD Operations
// ========================================

// 1. CREATE: Add a new SenRa message
app.post('/senra-message', async (req, res) => {
    try {
        console.log('Received data from SenRa:', req.body);  // Log the incoming data

        // Create a new message using the incoming data
        const newMessage = new Message(req.body);

        // Save the message to the database
        await newMessage.save();

        res.status(201).send({ success: true, message: 'Message created successfully!', data: newMessage });
    } catch (err) {
        res.status(400).send({ success: false, message: 'Error saving message', error: err });
    }
});


// 2. READ: Get all SenRa messages
app.get('/senra-messages', async (req, res) => {
    try {
        const messages = await Message.find();
        res.status(200).send({ success: true, data: messages });
    } catch (err) {
        res.status(500).send({ success: false, message: 'Error fetching messages', error: err });
    }
});

// 3. READ: Get a single SenRa message by ID
app.get('/senra-message/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).send({ success: false, message: 'Message not found' });
        }
        res.status(200).send({ success: true, data: message });
    } catch (err) {
        res.status(500).send({ success: false, message: 'Error fetching message', error: err });
    }
});

// 4. UPDATE: Update a message by ID
app.put('/senra-message/:id', async (req, res) => {
    try {
        const updatedMessage = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedMessage) {
            return res.status(404).send({ success: false, message: 'Message not found' });
        }
        res.status(200).send({ success: true, message: 'Message updated successfully!', data: updatedMessage });
    } catch (err) {
        res.status(400).send({ success: false, message: 'Error updating message', error: err });
    }
});

// 5. DELETE: Delete a message by ID
app.delete('/senra-message/:id', async (req, res) => {
    try {
        const deletedMessage = await Message.findByIdAndDelete(req.params.id);
        if (!deletedMessage) {
            return res.status(404).send({ success: false, message: 'Message not found' });
        }
        res.status(200).send({ success: true, message: 'Message deleted successfully!', data: deletedMessage });
    } catch (err) {
        res.status(500).send({ success: false, message: 'Error deleting message', error: err });
    }
});

// ========================================
// Server Listening
// ========================================
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
