"use client";

import React, { useContext } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import { SocketContext } from "../socketContext";
import { useState, useEffect } from "react";

const VideoPlayer = () => {
  const { call, callAccepted, myVideo, userVideo, stream, setStream, name, callEnded } = useContext(SocketContext);

  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      sx={{
        p: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      {!stream && (
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Waiting for media stream...
        </Typography>
      )}
      {stream && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            m: 1,
            border: "2px solid #3f51b5",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {name || "Name"}
            </Typography>
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{
                width: "100%",
                maxHeight: "400px",
                borderRadius: "10px",
                objectFit: "cover",
              }}
            />
          </Grid>
        </Paper>
      )}

      {callAccepted && !callEnded && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            m: 1,
            border: "2px solid #3f51b5",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {call.name || "Name"}
            </Typography>
            <video
              playsInline
              ref={userVideo}
              autoPlay
              style={{
                width: "100%",
                maxHeight: "400px",
                borderRadius: "10px",
                objectFit: "cover",
              }}
            />
          </Grid>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;

/*
import React from "react";
import { Grid, Typography, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { SocketContext } from "../socketContext";
import { useContext } from "react";

const useStyles = makeStyles((theme) => ({
  video: {
    width: "100%",
    maxHeight: "400px",
    [theme.breakpoints.down("sm")]: {
      width: "300px",
    },
    borderRadius: "10px",
    objectFit: "cover",
  },

  gridContainer: {
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },

  paper: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    border: "2px solid #3f51b5",
    backgroundColor: "#f5f5f5",
    boxShadow: theme.shadows[3],
  },
}));

const VideoPlayer = () => {
  const {
    call,
    callAccepted,
    myVideo,
    userVideo,
    stream,
    name,
    setName,
    callEnded,
    me,
    callUser,
    leaveCall,
    answerCall,
  } = useContext(SocketContext);
  const classes = useStyles();
  return (
    <Grid container className={classes.girdContainer}>
      {stream && (
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {name || "Name"}
            </Typography>
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className={classes.video}
            ></video>
          </Grid>
        </Paper>
      )}
      {callAccepted && !callEnded && (
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {call.name || "Name"}
            </Typography>
            <video
              playsInline
              muted
              ref={userVideo}
              autoPlay
              className={classes.video}
            ></video>
          </Grid>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;
*/
/*
useEffect(() => {
    if (!stream) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
          setStream(currentStream);
          if (currentStream && myVideo.current) {
            myVideo.current.srcObject = currentStream;
          }
        })
        .catch((err) => console.error("Error accessing media devices.", err));
    }
  }, []);

  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);
*/
