import { useState } from "react"
import imagePng from "data-base64:~assets/image.png"

function IndexPopup() {
  const [data, setData] = useState("")
  const [buttonClicked, setButtonClicked] = useState(false)

  const handleXButtonClick = () => {
    setButtonClicked(!buttonClicked)
    console.log("X button clicked!")
  }

  return (
    <div
      style={{
        padding: 16,
        backgroundColor: buttonClicked ? "#ffe0e0" : "white",
        transition: "background-color 0.3s",
        width: 380,  // Set fixed width
        height: 450, // Set fixed height
        maxWidth: "90vw", // Maximum width relative to viewport
        maxHeight: "80vh", // Maximum height relative to viewport
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
            top: "20vh",
            right: "30vw",
            backgroundColor: buttonClicked ? "red" : "#1D9BF0",
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
      
      <div style={{ 
        height: buttonClicked ? "auto" : "100px", // Reserve space even when not clicked
        color: "red" 
      }}>
        {buttonClicked && "X button was clicked!"}
      </div>

    </div>
  )
}

export default IndexPopup
