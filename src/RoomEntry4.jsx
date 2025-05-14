import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoRoom from './VideoRoom';
import VideoRoom4 from './VideoRoom4';

const RoomEntry4 = () => {
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
  const [connectionState, setConnectionState] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [roomEnded, setRoomEnded] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

const createRoom = async () => {
  if (isCreatingRoom) return;

  setIsCreatingRoom(true);
  try {
    const res = await axios.post('http://3.6.135.153:8080/api/v1/mwellness/create-room', {
      roomName,
      password,
      doctorId,
      userId,
    });
    setMessage('Room created successfully!');
    alert('Room created successfully!');
    console.log(res.data);
  } catch (err) {
    setMessage(err.response?.data?.message || 'Error creating room');
  } finally {
    setIsCreatingRoom(false);
  }
};



//   const createRoom = async () => {
//     try {
//       const res = await axios.post('http://localhost:8080/api/v1/mwellness/create-room', {
//         roomName,
//         password,
//         doctorId,
//         userId,
//       });
//       setMessage('Room created successfully!');
//       alert('Room created successfully!');
//       console.log(res.data);
//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Error creating room');
//     }
//   };

  const createParticipant = async () => {
    try {
      const res = await axios.post('http://3.6.135.153:8080/api/v1/mwellness/create-participant', {
        roomName,
        participantType,
        participantId,
      });
      setAuthToken(res.data.token);
      setMessage('Participant token generated!');
      alert('Participant token generated!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating participant');
    }
  };

  const enterRoom = async () => {
    try {
      const res = await axios.post('http://3.6.135.153:8080/api/v1/mwellness/enter-room', {
        roomName,
        password,
        authToken,
      });
      setRoomDetails(res.data.room);
      setInRoom(true);
      setConnectionState('connecting');
      setMessage('Successfully entered room!');
      alert('Successfully entered room!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to enter room');
    }
  };

// const enterRoom = async () => {
//     await checkRoomEnded(); // double-check
  
//     if (roomEnded) {
//       alert("This meeting has ended. You cannot join.");
//       return;
//     }
  
//     try {
//       const res = await axios.post('http://localhost:8080/api/v1/mwellness/enter-room', {
//         roomName,
//         password,
//         authToken,
//       });
//       setRoomDetails(res.data.room);
//       setInRoom(true);
//       setConnectionState('connecting');
//       setMessage('Successfully entered room!');
//       alert('Successfully entered room!');
//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Failed to enter room');
//     }
//   };
  

  const handleReconnect = async () => {
    try {
      setConnectionState('reconnecting');
      setReconnectAttempts(prev => prev + 1);
      
      // First check if room still exists
      const roomCheck = await axios.post('http://3.6.135.153:8080/api/v1/mwellness/enter-room', {
        roomName,
        password,
        authToken,
      });

      if (roomCheck.data.success) {
        setInRoom(true);
        setMessage('Reconnecting...');
      } else {
        setMessage('Room no longer available');
        setConnectionState('disconnected');
      }
    } catch (err) {
      if (reconnectAttempts < 3) {
        setTimeout(handleReconnect, 2000 * reconnectAttempts);
      } else {
        setMessage('Max reconnect attempts reached');
        setConnectionState('disconnected');
      }
    }
  };

  const handleLeaveRoom = () => {
    setInRoom(false);
    setConnectionState('disconnected');
    setReconnectAttempts(0);
  };

  const handleEndMeeting = () => {
    if (participantType === 'doctor') {
      // Doctor can end the meeting
      endRoom();
    } else {
      alert('Only the doctor can end the meeting.');
    }
  }

//   const checkRoomEnded = async () => {
//     try {
//       const res = await axios.get(`http://localhost:8080/api/v1/mwellness/room-status?roomName=${roomName}`);
//       setRoomEnded(res.data.isEnded);
//     } catch (err) {
//       console.error("Error checking room status", err);
//     }
//   };
  
const [isEndingRoom, setIsEndingRoom] = useState(false);

const endRoom = async () => {
    if (roomEnded || isEndingRoom) return; // Prevent multiple calls
    setIsEndingRoom(true);
    try {
        const res = await axios.post(`http://3.6.135.153:8080/api/v1/mwellness/end-room`, {
            roomName,
            participantType: 'doctor',
        });
        if (res.data.success) {
            setRoomEnded(true);
            handleLeaveRoom();
            setMessage('Room ended successfully!');
        } else {
            setMessage('Failed to end room');
        }
    } catch (err) {
        alert('Error ending room');
    } finally {
        setIsEndingRoom(false);
    }
};


//   useEffect(() => {
//     if (roomName) {
//       checkRoomEnded();
//     }
//   }, [roomName]);
  

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Twilio Video Room</h2>
      <p>Connection Status: {connectionState}</p>

      {!inRoom ? (
        <>
          <div>
            <h3>Create Room (Doctor)</h3>
            <input placeholder="Room Name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input placeholder="Doctor ID" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
            <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            {/* <button onClick={createRoom}>Create Room</button> */}
            <button onClick={createRoom} disabled={isCreatingRoom}>
                {isCreatingRoom ? 'Creating...' : 'Create Room'}
            </button>
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
        </>
       ) : (
        <div>
          {connectionState === 'disconnected' ? (
            <div>
              <p>You were disconnected from the room</p>
              {!roomEnded && <button onClick={handleReconnect}>Reconnect</button>}
              {/* <button onClick={handleLeaveRoom}>Leave Room</button> */}
            </div>
          ) : (
            <VideoRoom4
                token={authToken} 
                roomName={roomName} 
                onLeave={handleLeaveRoom}
                onDisconnect={() => {
                  setConnectionState('disconnected');
                  handleReconnect();
                }}
                onReconnect={() => setConnectionState('connected')}
                participantType={participantType} // 👈 pass this
                onDoctorEnd={participantType === 'doctor' ? handleEndMeeting : undefined} // 👈 pass to child
            />
          )}
          {/* {connectionState === 'disconnected' ? (
          <div>
            <p>You were disconnected from the room</p>
            {!roomEnded && <button onClick={handleReconnect}>Reconnect</button>}
            <button onClick={handleLeaveRoom}>Leave Room</button>
          </div>
        ) : (
          <VideoRoom4
            token={authToken}
            roomName={roomName}
            onLeave={handleLeaveRoom}
            onDisconnect={() => {
              setConnectionState('disconnected');
              handleReconnect();
            }}
            onReconnect={() => setConnectionState('connected')}
            participantType={participantType}
            // onDoctorEnd={participantType === 'doctor' ? endRoom : undefined} // 👈 pass to child
          />
        )} */}
        </div>
    )}

      <hr />
      {message && <p><strong>Status:</strong> {message}</p>}
    </div>
  );
};

export default RoomEntry4;