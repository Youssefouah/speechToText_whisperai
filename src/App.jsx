import { useState, useRef, useEffect } from 'react'
import './App.css'
import { ReactMic } from 'react-mic';
import axios from 'axios'

async function transcribe(file) {
  const response = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      file: file,
      model: 'whisper-1'
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${import.meta.env.VITE_APP_OPENAI_API_KEY}`
      }
    }
  );

  return response.data.text;
}

function App() {
  const [state, setState] = useState(false)
  const textRef = useRef()
  const [blobData, setBlobData] = useState([])
  // const [interval, setIntervalValue] = useState(null)

  // useEffect(() => {
  //   if (state) {
  //     const interval = setInterval(() => {
  //       sendAudio()
  //     }, 2400)
  //     setIntervalValue(interval)
  //   } else {
  //     clearInterval(interval)
  //   }
  // }, [state])

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        console.log('Microphone access granted');
        setState(true);
      })
      .catch((error) => {
        console.log('Microphone access denied:', error);
      });
  };

  const onData = async (recordedBlob) => {

  }

  const onStop = async (recordedBlob) => {
    console.log(recordedBlob)
    const tempData = blobData
    tempData.push(recordedBlob.blob)
    setBlobData(tempData)
    sendAudio()
  }

  const sendAudio = async () => {
    const file = new File(blobData, 'recording.wav', { type: 'audio/wav' })

    const result = await transcribe(file)
    textRef.current.value = result
    setBlobData([])
  }

  return (
    <div>
      <div style={{ height: 129, width: 640, position: 'relative' }}>
        <div className='background-mic' style={{ height: `100%`, width: `100%` }} hidden={state}></div>
        <div style={{ position: 'absolute', right: 0, top: 12 }}>
          <ReactMic
            record={state}
            className="sound-wave"
            onStop={onStop}
            onData={onData}
            strokeColor="#0A82C9"
            backgroundColor='#333333'
            mimeType='audio/wav'
          />
        </div>
      </div>
      <div>
        <button disabled={state} onClick={startRecording} type="button">Start</button>
        <button disabled={!state} onClick={() => setState(false)} type="button">Stop</button>
      </div>
      <textarea ref={textRef} style={{ marginTop: 10, width: "100%", height: 200 }} />
    </div>
  )
}

export default App
