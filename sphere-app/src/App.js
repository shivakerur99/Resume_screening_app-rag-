// Importing necessary components and libraries from React and other files
import { ThreeCircles } from "react-loader-spinner";
import React, { useState } from 'react';
import logo_chat from "./components/logo.png";
import "./App.css";
import Api from "./components/Api";

function App() {
// State variables for managing response data, file upload, loading state, user input, and chat log
const [responseData, setResponseData] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [input, setInput] = useState("");
const [chatLog, setChatLog] = useState([]);

// Function to handle file selection by the user
const handleFileChange = (event) => {
setSelectedFile(event.target.files[0]);
};


 // Function to upload selected file to the server
const uploadFile = async (e) => {
const formData = new FormData();
formData.append('file', selectedFile);
try {
  const data = await Api.post('/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  setResponseData(data.data);
  console.log(data.data)
  console.log('File uploaded successfully');
} catch (error) {
  console.error('Error uploading file:', error);
}
};

 // Function to handle form submission
async function handleSubmit(e) {
  e.preventDefault();
   // Update chat log with user input
  setChatLog([...chatLog, { user: "me", message: input }]);
  setInput("");
  setIsLoading(true);
  try {
    // Get user input from text area
    const clientInput = document.getElementById('userInputTextArea').value;
    console.log(clientInput);
    const postData = {
      responseData: responseData.content,
      userInput: clientInput
    };
     // Send user input to backend and get response
    const response = await Api.post('/doc/', postData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('Response from backend:', response.data);
    // Update chat log with response from backend
    setChatLog([...chatLog, { user: "me", message: clientInput }, { user: "gpt", message: response.data }]);
    setIsLoading(false);
  } catch (error) {
    console.error('Error sending data to backend:', error);
    setIsLoading(false);
  }
}
return (
<div>
  <nav className="nav">
    <div className="nav-logo">
    <img
      src={logo_chat}
      alt="logo"
      style={{ width: '75px', height: '45px' }}
    />
    </div>
    <div className="container">
      <div className="file-logo-container">
        {selectedFile &&
          <svg width="25" height="29" viewBox="0 0 25 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="25" height="28.2731" rx="3.386" fill="white" />
            <rect x="0.3386" y="0.3386" width="24.3228" height="27.5959" rx="3.0474" stroke="#0FA958" strokeOpacity="0.44" strokeWidth="0.677201" />
            <path d="M14.1365 6.77197V10.0451C14.1365 10.2621 14.2227 10.4703 14.3761 10.6237C14.5296 10.7772 14.7377 10.8634 14.9548 10.8634H18.2279" stroke="#0FA958" strokeWidth="1.0158" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.5914 21.5011H8.40854C7.9745 21.5011 7.55823 21.3287 7.25131 21.0218C6.9444 20.7148 6.77197 20.2986 6.77197 19.8645V8.40854C6.77197 7.9745 6.9444 7.55823 7.25131 7.25131C7.55823 6.9444 7.9745 6.77197 8.40854 6.77197H14.1365L18.228 10.8634V19.8645C18.228 20.2986 18.0555 20.7148 17.7486 21.0218C17.4417 21.3287 17.0254 21.5011 16.5914 21.5011Z" stroke="#0FA958" strokeWidth="1.0158" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
          <div className="filename">
            {selectedFile && `${selectedFile.name}`}
          </div>
      </div>
      <div className="Upload-container">
        <div className="file-upload-l">
          <div className="file-upload-logo-innerfile">
            <label htmlFor="fileInput" className="svg-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="svg-icon"
              >
                <g clipPath="url(#clip0_6_746)">
                  <path d="M9 16.875C13.3492 16.875 16.875 13.3492 16.875 9C16.875 4.65076 13.3492 1.125 9 1.125C4.65076 1.125 1.125 4.65076 1.125 9C1.125 13.3492 4.65076 16.875 9 16.875Z" stroke="black" strokeWidth="0.875" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.625 9H12.375" stroke="black" strokeWidth="0.875" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 5.625V12.375" stroke="black" strokeWidth="0.875" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                  <defs>
                    <clipPath id="clip0_6_746">
                      <rect width="18" height="18" fill="white" />
                    </clipPath>
                  </defs>
              </svg>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
            </label>
          </div>
          </div>
          <div className="file-upload-logo">

          <button className="btn-submit-upload" onClick={uploadFile}>
            Upload PDF
          </button>
        </div>
      </div>
    </div>
  </nav>
  <div className="chat-log">
    {chatLog.map((message, index) => (

      <ChatMessage key={index} message={message} />
    ))}
  </div>

  <div className="chatbox">
    <form onSubmit={handleSubmit}>
      <input
        className='chat-input'
        placeholder="Send a message..."
        id="userInputTextArea"
        value={input}
        onChange={(e) => setInput(e.target.value)}>
      </input>
    </form>
    <button className={`button-send ${isLoading ? 'disabled-button' : ''}`} onClick={handleSubmit}>
      {isLoading ? (
        <ThreeCircles color="#0FA958" height={50} width={40} timeout={3000} />
      ) : (
        <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.1667 7.99999L0.75 15.3333L4.01608 7.99999L0.75 0.666656L18.1667 7.99999ZM18.1667 7.99999H3.95833" stroke="#222222" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  </div>
</div>
);
}
// ChatMessage component to display individual chat messages
const ChatMessage = ({ message }) => {
return (
<div className={`chat-message ${message.user === "gpt" && "chatgpt"}`}>
  <div className={`avatar2 ${message.user === "gpt" && "chatgpt"}`}>
     {/* Displaying GPT avatar if user is GPT */}
    {message.user === "gpt" && <img
      src={logo_chat}
      alt="logo"
      style={{ width: '45px', height: '35px' }}
    />}
    {message.user === "me" && <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="20" fill="#B0ACE9" />
                              <path d="M24.1201 16.1307C24.0292 15.3239 23.6542 14.6989 22.9951 14.2557C22.336 13.8068 21.5065 13.5824 20.5065 13.5824C19.7906 13.5824 19.1713 13.696 18.6485 13.9233C18.1258 14.1449 17.7195 14.4517 17.4298 14.8438C17.1457 15.2301 17.0036 15.6705 17.0036 16.1648C17.0036 16.5795 17.1002 16.9375 17.2934 17.2386C17.4923 17.5398 17.7508 17.7926 18.069 17.9972C18.3928 18.196 18.7394 18.3636 19.1088 18.5C19.4781 18.6307 19.8332 18.7386 20.1741 18.8239L21.8786 19.267C22.4355 19.4034 23.0065 19.5881 23.5917 19.821C24.1769 20.054 24.7195 20.3608 25.2195 20.7415C25.7195 21.1222 26.123 21.5938 26.4298 22.1562C26.7423 22.7188 26.8985 23.392 26.8985 24.1761C26.8985 25.1648 26.6428 26.0426 26.1315 26.8097C25.6258 27.5767 24.89 28.1818 23.9241 28.625C22.9639 29.0682 21.8019 29.2898 20.4383 29.2898C19.1315 29.2898 18.0008 29.0824 17.0463 28.6676C16.0917 28.2528 15.3445 27.6648 14.8048 26.9034C14.265 26.1364 13.9667 25.2273 13.9099 24.1761H16.5519C16.6031 24.8068 16.8076 25.3324 17.1656 25.7528C17.5292 26.1676 17.9923 26.4773 18.5548 26.6818C19.123 26.8807 19.7451 26.9801 20.4213 26.9801C21.1656 26.9801 21.8275 26.8636 22.407 26.6307C22.9923 26.392 23.4525 26.0625 23.7877 25.642C24.123 25.2159 24.2906 24.7187 24.2906 24.1506C24.2906 23.6335 24.1428 23.2102 23.8474 22.8807C23.5576 22.5511 23.1627 22.2784 22.6627 22.0625C22.1684 21.8466 21.6088 21.6562 20.9838 21.4915L18.9213 20.929C17.5235 20.5483 16.4156 19.9886 15.5974 19.25C14.7849 18.5114 14.3786 17.5341 14.3786 16.3182C14.3786 15.3125 14.6514 14.4347 15.1968 13.6847C15.7423 12.9347 16.4809 12.3523 17.4127 11.9375C18.3445 11.517 19.3957 11.3068 20.5661 11.3068C21.748 11.3068 22.7906 11.5142 23.694 11.929C24.6031 12.3438 25.319 12.9148 25.8417 13.642C26.3644 14.3636 26.6372 15.1932 26.6599 16.1307H24.1201Z" fill="white" />
                            </svg>}
  </div>
    <div className="msg">
      {message.message}
    </div>
</div>
)
}
export default App;

