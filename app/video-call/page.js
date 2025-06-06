"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";
import { set } from "mongoose";
import Peer from "simple-peer";

import {
  Typography,
  AppBar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
} from "@mui/material";

import VideoPlayer from "../callComponents/VideoPlayer";
import Options from "../callComponents/Options";
import Notifications from "../callComponents/Notifications";

// Create a theme instance
const theme = createTheme();

const VideoCall = () => {
  return (
    <Container maxWidth="lg">
      <AppBar position="static" color="inherit">
        <Typography variant="h2" align="center">
          Video Chat
        </Typography>
      </AppBar>
      <VideoPlayer />
      <Options>
        <Notifications />
      </Options>
    </Container>
  );
};

export default VideoCall;
/*
const theme = createTheme({
  palette: {
    mode: "light",
  },
});
*/

/*
const VideoCall = () => {
  const { roomId } = useParams();
  console.log("room Id is:", roomId);
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    console.log("[INIT] Connecting to socket...");
    socketRef.current = io("https://webrtc-backend-6rqg.onrender.com/");
    socketRef.current.emit("join-room", roomId);
    console.log("[SOCKET] Joined room:", roomId);

    socketRef.current.on("offer", async (offer) => {
      console.log("[SOCKET] Received offer:", offer);
      await createAnswer(offer);
    });

    socketRef.current.on("answer", async (answer) => {
      console.log("[SOCKET] Received answer");
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      console.log("[PEER] Set remote description with answer");
    });

    socketRef.current.on("ice-candidate", async (candidate) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(candidate);
          console.log("[PEER] Added received ICE candidate:", candidate);
        } catch (err) {
          console.error("[ERROR] Adding ICE candidate:", err);
        }
      }
    });

    return () => {
      socketRef.current.disconnect();
      console.log("[CLEANUP] Socket disconnected");
    };
  }, [roomId]);

  const startCall = async () => {
    console.log("[CALL] Starting call...");
    setIsCalling(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = stream;
    localStreamRef.current = stream;
    console.log("[MEDIA] Got local media stream:", stream);

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = peer;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
      console.log("[PEER] Added local track:", track);
    });

    peer.ontrack = (event) => {
      console.log("[PEER] ontrack event fired:", event.streams);

      const remoteStream =
        remoteVideoRef.current.srcObject || new MediaStream();

      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });

      remoteVideoRef.current.srcObject = remoteStream;

      setTimeout(() => {
        remoteVideoRef.current
          .play()
          .then(() => console.log("[REMOTE] Playing remote stream"))
          .catch((err) =>
            console.error("[REMOTE] Autoplay error (answerer)", err)
          );
      }, 200);
    };
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[ICE] Sending candidate:", event.candidate);
        socketRef.current.emit("ice-candidate", event.candidate, roomId);
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    console.log("[PEER] Created and set local description with offer");

    socketRef.current.emit("offer", offer, roomId);
    console.log("[SOCKET] Sent offer to room:", roomId);
  };

  const createAnswer = async (offer) => {
    console.log("[ANSWER] Creating answer for offer:", offer);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = stream;
    localStreamRef.current = stream;
    console.log("[MEDIA] Got local media for answer");

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = peer;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
      console.log("[PEER] Added local track (answerer):", track);
    });

    peer.ontrack = (event) => {
      console.log("[PEER] ontrack event fired:", event.streams);

      const remoteStream =
        remoteVideoRef.current.srcObject || new MediaStream();

      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });

      remoteVideoRef.current.srcObject = remoteStream;

      setTimeout(() => {
        remoteVideoRef.current
          .play()
          .then(() => console.log("[REMOTE] Playing remote stream"))
          .catch((err) =>
            console.error("[REMOTE] Autoplay error (answerer)", err)
          );
      }, 200);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[ICE] Sending candidate (answerer):", event.candidate);
        socketRef.current.emit("ice-candidate", event.candidate, roomId);
      }
    };

    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    console.log("[PEER] Set remote description with offer");

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    console.log("[PEER] Created and set local description with answer");

    socketRef.current.emit("answer", answer, roomId);
    console.log("[SOCKET] Sent answer to room:", roomId);
  };

  return (
    <div>
      <div>Connected to room: {roomId}</div>
      <div className="relative w-full h-screen bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-black"
        ></video>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 w-32 h-24 rounded-md border border-white shadow-lg object-cover"
        ></video>
      </div>
      {!isCalling && (
        <button
          onClick={startCall}
          className="fixed bottom-8 left-8 px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Call
        </button>
      )}
    </div>
  );
};

export default VideoCall;
*/

/*
const VideoCall = () => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [call, setCall] = useState(null); // now holds call data or null
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [idToCall, setIdToCall] = useState(""); // user can enter this manually for testing


  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("https://webrtc-backend-new.onrender.com");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      });

    socketRef.current.on("me", (id) => setMe(id));

    socketRef.current.on("calluser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socketRef.current.emit("answercall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = () => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socketRef.current.emit("calluser", {
        userToCall: me, // replace this with the actual target user id
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socketRef.current.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current?.destroy();
    window.location.reload();
  };

  return (
    <div>
      <div className="relative w-full h-screen bg-black">
        {callAccepted && !callEnded && (
          <video
            ref={userVideo}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-black"
          ></video>
        )}
        {stream && (
          <video
            ref={myVideo}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-32 h-24 rounded-md border border-white shadow-lg object-cover"
          ></video>
        )}
      </div>
      <div className="fixed bottom-8 left-8 flex gap-4">
        {!call && !callAccepted && (
          <button
            onClick={callUser}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Start Call
          </button>
        )}
        {call?.isReceivedCall && !callAccepted && (
          <button
            onClick={answerCall}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Answer Call
          </button>
        )}
        {callAccepted && !callEnded && (
          <button
            onClick={leaveCall}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
*/

/*
console.log("[PEER] ontrack (answerer) fired:", event.streams);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setTimeout(() => {
          remoteVideoRef.current
            .play()
            .then(() => console.log("[REMOTE] Playing remote stream"))
            .catch((err) =>
              console.error("[REMOTE] Autoplay error (answerer)", err)
            );
        }, 200);
      }
*/

/*
"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";

const VideoCall = () => {
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    socketRef.current = io("https://webrtc-backend-6rqg.onrender.com/");
    socketRef.current.emit("join-room", roomId);

    // Listen for offer
    socketRef.current.on("offer", async (offer) => {
      console.log("Received offer:", JSON.stringify(offer));
      await createAnswer(offer);
    });

    // Listen for answer
    socketRef.current.on("answer", async (answer) => {
      console.log("Received answer");
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // Listen for ICE candidate
    socketRef.current.on("ice-candidate", async (candidate) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding received ICE candidate", err);
        }
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const startCall = async () => {
    setIsCalling(true);
    // 1. Get local media
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = stream;
    localStreamRef.current = stream;

    // 2. Create RTCPeerConnection
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = peer;

    // 3. Add local tracks to peer
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    // 4. Listen for remote stream
    peer.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // 5. Send ICE candidates to other peer
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", event.candidate, roomId);
      }
    };

    // 6. Create and send offer
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socketRef.current.emit("offer", offer, roomId);
  };

  const createAnswer = async (offer) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = stream;
    localStreamRef.current = stream;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = peer;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    console.log(remoteVideoRef.current.srcObject)

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", event.candidate, roomId);
      }
    };

    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socketRef.current.emit("answer", answer, roomId);
  };

  return (
    <div>
      <div>Connected to room: {roomId}</div>
      <div className="relative w-full h-screen bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        ></video>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 w-32 h-24 rounded-md border border-white shadow-lg object-cover"
        ></video>
      </div>
      {!isCalling && (
        <button
          onClick={startCall}
          className="fixed bottom-8 left-8 px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Call
        </button>
      )}
    </div>
  );
};

export default VideoCall;
*/
/*
const server = {
    iceServer: [
      {
        urls: ['stun:stun.1.google.com:19302','stun:stun2.1.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
}

let pc =  new RTCPeerConnection(servers)
peer.ontrack = event => {
  event.streams[0].getTracks().forEach(track => {
    remoteVideoRef.current.srcObject.addTrack(track)
  });
}
*/
