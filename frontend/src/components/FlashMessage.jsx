import React from "react"
import { useFlashMessage } from "../hooks/useFlashMessage"
import "../styles/FlashMessage.css"

const FlashMessage = () => {
    const { flashMessage, hideMessage } = useFlashMessage()
    const messageRef = React.useRef(null)

    if (!flashMessage) return null

    const { message, type } = flashMessage

    const handleClose = () => {
        hideMessage()
    }

    const toCapitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    return (
        <div className="flashMessage">
            <span className={`message ${type} fadeIn`} ref={messageRef}>
                {toCapitalizeFirstLetter(message)}
                <button onClick={handleClose}>×</button>
            </span>
        </div>
    )
}

export default FlashMessage