import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import aneesPic from "./assets/anees.jpg";
import geminiPic from "./assets/gemini AI.png";

function App() {
  const [question, setQuestion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;

  // Use ref to store the latest response
  const responseRef = useRef("");

  useEffect(() => {
    // Stop speech when the page is reloaded or closed
    const stopSpeechOnReload = () => {
      if (synth.speaking || synth.paused) {
        synth.cancel(); // Ensure speech is canceled
      }
    };

    // Add an event listener to handle beforeunload
    window.addEventListener("beforeunload", stopSpeechOnReload);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", stopSpeechOnReload);
    };
  }, [synth]);

  const submitHandler = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    axios
      .post("/getResponse", { question })
      .then((res) => {
        const newResponse = res.data.response;
        console.log(newResponse);

        responseRef.current = newResponse; // Store the response in the ref
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
      console.log("No response to speak.");
    }
  };

  return (
    <div className="App">
      <div className="box">
        <div className="profile-pic">
          <img
            className="pic"
            alt="profile pic"
            src={aneesPic}
          />
        </div>
        <p className="label">Question</p>
        <textarea
          value={question}
          style={{ resize: "none" }}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={submitHandler} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Send"}
        </button>
      </div>
      <div className="box">
        <div className="profile-pic">
          <img
            className="pic"
            alt="profile pic"
            src={geminiPic}
          />
        </div>
        <p className="label">Response</p>
        <textarea
          value={responseRef.current}
          readOnly
          style={{ resize: "none" }}
        />

        <button onClick={speakHandler}>{isSpeaking ? "Pause" : "Speak"}</button>
      </div>
    </div>
  );
}

export default App;
