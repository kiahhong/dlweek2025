import { useState, useEffect } from "react"
import imagePng from "data-base64:~assets/image.png"

function IndexPopup() {
  const [data, setData] = useState("")
  const [showProgress, setShowProgress] = useState(false)
  const [progress, setProgress] = useState(0)

  // Reset progress and show the progress bar when button is clicked
  const handleXButtonClick = () => {
    setShowProgress(true)
    setProgress(0)
    console.log("X button clicked!")
  }

  // Progress bar animation effect
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    if (showProgress && progress < 100) {
      progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + 1;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
          }
          return newProgress;
        });
      }, 30); // Adjust speed by changing this value
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [showProgress, progress]);

  return (
    <div
      style={{
        padding: 16,
        backgroundColor: "black",
        transition: "background-color 0.3s",
        width: 380,  // Set fixed width
        height: 450, // Set fixed height
        maxWidth: "90vw", // Maximum width relative to viewport
        maxHeight: "83vh", // Maximum height relative to viewport
        display: "flex",
        flexDirection: "column"
      }}>
      
      <div style={{ 
        position: "relative", 
        marginBottom: 16,
        flexShrink: 0 // Prevent image from shrinking
      }}>
        <img 
          src={imagePng} 
          alt="Featured Image"
          style={{ 
            width: "100%",
            display: "block",
            height: "auto"
          }}
        />
        
        <div 
          onClick={handleXButtonClick}
          style={{
            position: "absolute",
            top: "19vh",
            right: "31vw",
            backgroundColor: "#1D9BF0",
            color: "white",
            borderRadius: "50%",
            width: "20vw",
            height: "20vw",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "10vw",
            transition: "background-color 0.3s"
          }}>
          X
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div style={{ 
        height: 20,
        width: "100%",
        backgroundColor: "#e0e0e0",
        borderRadius: 10,
        marginBottom: 20,
        overflow: "hidden",
        display: showProgress ? "block" : "none"
      }}>
        {/* Progress Bar Fill */}
        <div style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: "#1D9BF0",
          borderRadius: 10,
          transition: "width 0.1s ease-in-out"
        }} />
      </div>

    </div>
  )
}

export default IndexPopup
