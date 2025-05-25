import React from "react";
import { useState, useContext } from "react";
import { Box } from '@mui/material';
import { Button, TextField, Grid, Typography, Container, Paper, } from "@mui/material";
import { Assignment, Phone, PhoneDisabled } from "@mui/icons-material";
import { SocketContext } from "../socketContext";

const Options = ({ children }) => {
  const { callAccepted, name, setName, callEnded, me, callUser, leaveCall, idToCall, setIdToCall } = useContext(SocketContext);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={10} sx={{ p: 4, textAlign: "center" }}>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="h6">
                Account Info
              </Typography>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Assignment fontSize="large" />}
                onClick={() => copyToClipboard(me)}
              >
                Copy Your ID
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="h6">
                Make a call
              </Typography>
              <TextField
                label="ID to call"
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              {callAccepted && !callEnded ? (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PhoneDisabled fontSize="large" />}
                  fullWidth
                  onClick={leaveCall}
                >
                  Hang Up
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Phone fontSize="large" />}
                  fullWidth
                  onClick={() => callUser(idToCall)}
                >
                  Call
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
        {children}
      </Paper>
    </Container>
  );
};

export default Options;
/*
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
  },
  gridContainer: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: theme.spacing(3),
  },
  margin: {
    margin: theme.spacing(2),
  },
  padding: {
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
  },
}));

const classes = useStyles() 

<Container className={classes.container}>
      <Paper elevation={10} className={classes.paper}>
        <form className={classes.root} noValidate autoComplete="off">
          <Grid container className={classes.gridContainer}>
            <Grid item xs={12} md={6} className={classes.padding}>
              <Typography gutterBottom variant="h6">Account Info</Typography>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <Button variant="contained" color="primary" fullWidth startIcon={<Assignment fontSize="large" />} onClick={() => copyToClipboard(me)}>Copy Your ID</Button>
            </Grid>
            <Grid item xs={12} md={6} className={classes.padding}>
              <Typography gutterBottom variant="h6">Make a call</Typography>
              <TextField label="ID to call" value={idToCall} onChange={(e) => setIdToCall(e.target.value)} fullWidth/>
              {callAccepted && !callEnded ? (
                <Button variant="contained" color="secondary" startIcon={<PhoneDisabled fontSize="large" />} fullWidth onClick={leaveCall} className={classes.margin}>
                  Hang Up
                </Button>
              ):(
                <Button variant="contained" color="primary" startIcon={<Phone fontSize="large" />} fullWidth onClick={() => callUser(idToCall)} className={classes.margin}>Call</Button>
              )
              }
            </Grid>
          </Grid>
        </form>
        {children}
      </Paper>
    </Container>
*/
