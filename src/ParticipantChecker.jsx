import React, { useState } from 'react';
import axios from 'axios';

function ParticipantChecker() {
  const [roomName, setRoomName] = useState('');
  const [localCount, setLocalCount] = useState(null);
  const [twilioCount, setTwilioCount] = useState(null);
  const [participants, setParticipants] = useState([]);

  const checkCounts = async () => {
    try {
      const localRes = await axios.get(`http://3.6.135.153:8080/api/v1/mwellness/participants/local?roomName=${roomName}`);
      const twilioRes = await axios.get(`http://3.6.135.153:8080/api/v1/mwellness/participants/twilio?roomName=${roomName}`);

      setLocalCount(localRes.data.count);
      setTwilioCount(twilioRes.data.count);
      setParticipants(twilioRes.data.participants);
    } catch (err) {
      console.error(err);
      alert('Error fetching participant counts');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Check Room Participants</h2>
      <input
        type="text"
        placeholder="Enter Room Name"
        value={roomName}
        onChange={e => setRoomName(e.target.value)}
        style={{ padding: 8, marginRight: 10 }}
      />
      <button onClick={checkCounts} style={{ padding: 8 }}>
        Check Participants
      </button>

      {localCount !== null && (
        <div>
          <p>🔒 Local participant count: {localCount}</p>
          <p>🌐 Twilio participant count: {twilioCount}</p>
          <ul>
            {participants.map(p => (
              <li key={p.sid}>{p.identity}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ParticipantChecker;
