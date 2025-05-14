// src/components/VideoRoom.js
import React, { useEffect, useRef, useState } from 'react';
import Video from 'twilio-video';

const VideoRoom = ({ token, roomName, onLeave }) => {
  const [room, setRoom] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    Video.connect(token, { name: roomName }).then(room => {
      setRoom(room);
      const localTrackPub = Array.from(room.localParticipant.videoTracks.values())[0];
      if (localTrackPub) {
        localVideoRef.current.appendChild(localTrackPub.track.attach());
      }

      room.participants.forEach(participant => {
        participant.tracks.forEach(publication => {
          if (publication.track) {
            remoteVideoRef.current.appendChild(publication.track.attach());
          }
        });

        participant.on('trackSubscribed', track => {
          remoteVideoRef.current.appendChild(track.attach());
        });
      });

      room.on('participantConnected', participant => {
        participant.on('trackSubscribed', track => {
          remoteVideoRef.current.appendChild(track.attach());
        });
      });

      room.on('disconnected', () => {
        room.localParticipant.tracks.forEach(pub => pub.track.stop());
      });
    });

    return () => {
      if (room) room.disconnect();
    };
  }, [token, roomName]);

  const toggleVideo = () => {
    room.localParticipant.videoTracks.forEach(pub => {
      if (isVideoEnabled) {
        pub.track.disable();
      } else {
        pub.track.enable();
      }
    });
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    room.localParticipant.audioTracks.forEach(pub => {
      if (isAudioEnabled) {
        pub.track.disable();
      } else {
        pub.track.enable();
      }
    });
    setIsAudioEnabled(!isAudioEnabled);
  };

  const leaveRoom = () => {
    if (room) room.disconnect();
    onLeave();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <h4>Local Video</h4>
          <div ref={localVideoRef} />
        </div>
        <div>
          <h4>Remote Video</h4>
          <div ref={remoteVideoRef} />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={toggleVideo}>
          {isVideoEnabled ? 'Stop Video' : 'Start Video'}
        </button>
        <button onClick={toggleAudio}>
          {isAudioEnabled ? 'Mute' : 'Unmute'}
        </button>
        <button onClick={leaveRoom} style={{ color: 'red' }}>
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoRoom;
