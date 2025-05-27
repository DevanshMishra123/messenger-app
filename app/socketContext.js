"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";
import { set } from "mongoose";
import Peer from "simple-peer";
import { createContext } from "react";

const SocketContext = createContext();

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [call, setCall] = useState({}); // now holds call data or null
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [idToCall, setIdToCall] = useState(""); // user can enter this manually for testing

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => console.error("Error accessing media devices:", err));

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    socketRef.current = io("https://webrtc-backend-new.onrender.com");

    socketRef.current.on("me", (id) => setMe(id));

    socketRef.current.on("calluser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });

    socketRef.current.on("callEnded", () => {
      setCallEnded(true);
      connectionRef.current?.destroy();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
      console.log("stream:", stream);
      console.log("myVideo ref:", myVideo.current);
    }
  }, [myVideo, stream]);

  const answerCall = () => {
    if (!stream) {
      console.warn("Stream not ready yet. Cannot answer call.");
      return;
    }

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

    peer.on("connect", () => {
      console.log("Peer connection established.");
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = (calleeId) => {
    if (!stream) {
      console.warn("Stream not ready yet. Please wait for media permission.");
      return;
    }
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socketRef.current.emit("calluser", {
        userToCall: calleeId, // replace this with the actual target user id
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      console.log("current stream", currentStream);
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.on("connect", () => {
      console.log("Peer connection established.");
    });

    socket.off("callAccepted");
    socketRef.current.once("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCall({});
    setCallAccepted(false);
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

  };

  return (
    <SocketContext.Provider
      value={{ call, callAccepted, myVideo, userVideo, stream, setStream, name, setName, callEnded, me, callUser, leaveCall, answerCall, idToCall, setIdToCall }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
/*
navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      });
*/
/*
useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);
*/
/*
useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => console.error("Error accessing media devices:", err));

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
*/
/*
const startMedia = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };
*/