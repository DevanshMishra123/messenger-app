import React from 'react'
import { Button } from '@mui/material'
import { useContext } from 'react'
import { SocketContext } from '../socketContext'

const Notifications = () => {
  const { answerCall, call, callAccepted } = useContext(SocketContext)
  return (
    <>
       {call.isReceivedCall && !callAccepted && (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <h1>{call.name} is calling:</h1>
            <Button variant='contained' color='primary' onClick={answerCall}>Answer Call</Button>
          </div>
       )}
    </>
  )
}

export default Notifications