import React from "react"
import { useFlashMessage } from "../hooks/useFlashMessage"
import "../styles/FlashMessage.css"

const FlashMessage = () => {
    const { flashMessage, hideMessage, prepHide } = useFlashMessage()
    const messageRef = React.useRef(null)

    if (!flashMessage) return null

    if (prepHide) {
        messageRef.current.classList.add("fade-out")
    }

    const { message, type } = flashMessage

    const handleClose = () => {
        hideMessage()
    }

    const toCapitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    return (
        <div className="flash-message">
            <span className={`message ${type} fade-in`} ref={messageRef}>
                {toCapitalizeFirstLetter(message)}
                <button className="close-button" onClick={handleClose}>×</button>
            </span>
        </div>
    )
}

export default FlashMessage