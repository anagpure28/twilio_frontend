import React, { useEffect, useRef, useState } from 'react';
import Video from 'twilio-video';

const VideoRoom4 = ({ token, roomName, onLeave, onDisconnect, onReconnect, participantType, onDoctorEnd }) => {
    const [room, setRoom] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [networkQuality, setNetworkQuality] = useState(null);
  const [hasEnded, setHasEnded] = useState(false);

const handleDoctorEnd = () => {
    if (hasEnded) return; // Prevent duplicate calls
    setHasEnded(true);
    if (room) room.disconnect();
    onDoctorEnd();
};

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectToRoom = async () => {
    try {
      const newRoom = await Video.connect(token, { 
        name: roomName,
        audio: true,
        video: true,  // For Audio Call purpose only
        networkQuality: {
          local: 1, // Send local network quality
          remote: 1 // Receive remote network quality
        }
      });

      setRoom(newRoom);
      onReconnect();

      // Setup local track
      const localTrackPub = Array.from(newRoom.localParticipant.videoTracks.values())[0];
      if (localTrackPub) {
        localVideoRef.current.appendChild(localTrackPub.track.attach());
      }

      // Handle existing participants
      const existingParticipants = Array.from(newRoom.participants.values());
      setParticipants(existingParticipants);
      
      existingParticipants.forEach(participant => {
        participant.tracks.forEach(publication => {
          if (publication.track) {
            remoteVideoRef.current.appendChild(publication.track.attach());
          }
        });
      });

      // Event listeners
      newRoom.on('participantConnected', participant => {
        setParticipants(prev => [...prev, participant]);
        
        participant.on('trackSubscribed', track => {
          remoteVideoRef.current.appendChild(track.attach());
        });
        
        participant.on('trackUnsubscribed', track => {
          track.detach().forEach(element => element.remove());
        });
      });

      newRoom.on('participantDisconnected', participant => {
        setParticipants(prev => prev.filter(p => p !== participant));
        participant.tracks.forEach(track => {
          track.detach().forEach(element => element.remove());
        });
      });

      newRoom.on('disconnected', room => {
        // Clean up local tracks
        room.localParticipant.tracks.forEach(trackPublication => {
          trackPublication.track.stop();
          trackPublication.track.detach().forEach(element => element.remove());
        });
        
        // Notify parent about disconnection
        onDisconnect();
      });

      newRoom.on('reconnected', () => {
        clearTimeout(reconnectTimeoutRef.current);
        onReconnect();
      });

      newRoom.on('reconnecting', error => {
        console.log('Reconnecting due to:', error);
      });

      newRoom.localParticipant.on('networkQualityLevelChanged', level => {
        setNetworkQuality(level);
      });

    } catch (error) {
      console.error('Failed to connect to room:', error);
      onDisconnect();
    }
  };

  useEffect(() => {
    connectToRoom();

    return () => {
      if (room) {
        room.disconnect();
        room.localParticipant.tracks.forEach(trackPublication => {
          trackPublication.track.stop();
          trackPublication.track.detach().forEach(element => element.remove());
        });
      }
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [token]);

  const toggleVideo = () => {
    if (!room) return;
    
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
    if (!room) return;
    
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
          <h4>Local Video {networkQuality && `(Network: ${networkQuality})`}</h4>
          <div ref={localVideoRef} />
        </div>
        <div>
          <h4>Remote Participants ({participants.length})</h4>
          <div ref={remoteVideoRef} />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={toggleVideo} disabled>
          {isVideoEnabled ? 'Stop Video' : 'Start Video'}
        </button>
        <button onClick={toggleAudio}>
          {isAudioEnabled ? 'Mute' : 'Unmute'}
        </button>

        <button onClick={leaveRoom} style={{ color: 'red' }}>
          Leave Meeting
        </button>

        {participantType === 'doctor' && (
            <button onClick={handleDoctorEnd} disabled={hasEnded} style={{ color: 'white', backgroundColor: 'red', marginLeft: '10px' }}>
            End Meeting
        </button>
            // <button onClick={() => {
            //     if (room) room.disconnect(); // optional extra cleanup
            //     onDoctorEnd(); // Notify parent about ending the meeting
            // }} style={{ color: 'white', backgroundColor: 'red', marginLeft: '10px' }}>
            //     End Meeting
            // </button>
            )}
      </div>

    </div>
  );
};

export default VideoRoom4;