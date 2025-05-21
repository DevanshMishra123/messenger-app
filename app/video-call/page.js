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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current
          .play()
          .then(() => console.log("[REMOTE] Playing remote stream"))
          .catch((err) =>
            console.error("[REMOTE] Autoplay issue, user interaction required", err)
          );
      }
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
      console.log("[PEER] ontrack (answerer) fired:", event.streams);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current
          .play()
          .then(() => console.log("[REMOTE] Playing remote stream"))
          .catch((err) =>
            console.error("[REMOTE] Autoplay error (answerer)", err)
          );
      }
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
