// src/components/RoomEntry.js
import React, { useState } from 'react';
import axios from 'axios';
import Video from 'twilio-video';
import VideoRoom from './VideoRoom';


const RoomEntry2 = () => {
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [participantType, setParticipantType] = useState('user');
  const [participantId, setParticipantId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [userId, setUserId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [message, setMessage] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [inRoom, setInRoom] = useState(false);

  const createRoom = async () => {
    try {
      const res = await axios.post('http://localhost:9000/api/video/create-room', {
        roomName,
        password,
        doctorId,
        userId,
      });
      setMessage('Room created successfully!');
      console.log(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating room');
    }
  };

  const createParticipant = async () => {
    try {
      const res = await axios.post('http://localhost:9000/api/video/create-participant', {
        roomName,
        participantType,
        participantId,
      });
      setAuthToken(res.data.token);
      setMessage('Participant token generated!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating participant');
    }
  };

  const enterRoom = async () => {
    try {
      const res = await axios.post('http://localhost:9000/api/video/enter-room', {
        roomName,
        password,
        authToken,
      });
      setRoomDetails(res.data.room);
      setInRoom(true);
      setMessage('Successfully entered room!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to enter room');
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Twilio Video Room</h2>

      <div>
        <h3>Create Room (Doctor)</h3>
        <input placeholder="Room Name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
        <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input placeholder="Doctor ID" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
        <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <button onClick={createRoom}>Create Room</button>
      </div>

      <hr />

      <div>
        <h3>Create Participant Token</h3>
        <select value={participantType} onChange={(e) => setParticipantType(e.target.value)}>
          <option value="doctor">Doctor</option>
          <option value="user">User</option>
        </select>
        <input placeholder="Participant ID" value={participantId} onChange={(e) => setParticipantId(e.target.value)} />
        <button onClick={createParticipant}>Generate Token</button>
      </div>

      <hr />

      <div>
        <h3>Enter Room</h3>
        <input placeholder="Auth Token" value={authToken} onChange={(e) => setAuthToken(e.target.value)} />
        <button onClick={enterRoom}>Enter Room</button>
      </div>

      <hr />

      {inRoom && (
        <VideoRoom token={authToken} roomName={roomName} onLeave={() => setInRoom(false)} />
      )}

      <hr />
      {message && <p><strong>Status:</strong> {message}</p>}
      {roomDetails && (
        <div>
          <h4>Room Details</h4>
          <pre>{JSON.stringify(roomDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default RoomEntry2;
