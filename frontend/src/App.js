import { useState, useRef } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [question, setQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;
  
  // Use ref to store the latest response
  const responseRef = useRef('');

  const submitHandler = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    axios
      .post('http://localhost:3000/getResponse', { question })
      .then((res) => {
        const newResponse = res.data.response;
        console.log(newResponse);

        responseRef.current = newResponse; // Store the response in the ref
        setQuestion(''); // Clear the question field

        // Speak the new response
        speakNewResponse(newResponse);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const speakNewResponse = (text) => {
    if (synth.speaking || synth.paused) {
      synth.cancel(); // Cancel any ongoing or paused speech
    }

    // Add a slight delay to ensure complete cancellation
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Track the speaking state
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synth.speak(utterance); // Speak the provided text
    }, 50); // Delay to allow cancellation
  };

  const speakHandler = () => {
    const latestResponse = responseRef.current; // Get the latest response from the ref

    if (latestResponse) {
      if (synth.speaking || synth.paused) {
        // If speaking, toggle pause/resume
        if (isSpeaking) {
          synth.pause();
          setIsSpeaking(false);
        } else {
          synth.resume();
          setIsSpeaking(true);
        }
      } else {
        // If not currently speaking, speak the latest response
        speakNewResponse(latestResponse);
      }
    } else {
      console.log('No response to speak.');
    }
  };

  return (
    <div className="App">
      <div className="box">
        <div className="profile-pic">
          <img
            className="pic"
            alt="profile pic"
            src={require('../src/assets/anees.jpg')}
          />
        </div>
        <p className="label">Question</p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={submitHandler} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Send'}
        </button>
      </div>
      <div className="box">
        <div className="profile-pic">
          <img
            className="pic"
            alt="profile pic"
            src={require('../src/assets/gemini AI.png')}
          />
        </div>
        <p className="label">Response</p>
        <textarea value={responseRef.current} readOnly />
        <button onClick={speakHandler}>
          {isSpeaking ? 'Pause' : 'Speak'}
        </button>
      </div>
    </div>
  );
}

export default App;
