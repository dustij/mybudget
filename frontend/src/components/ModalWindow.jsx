import React from "react"
import { useModalWindow } from "../hooks/useModalWindow"
import "../styles/ModalWindow.css"

const ModalWindow = () => {
    const { modalWindow, hideModalWindow } = useModalWindow()

    if (!modalWindow) {
        return null
    }

    const { title, content } = modalWindow

    return (
        <div className="modal-window">
            <div className="modal-window-content">
                <div className="modal-window-title">
                    <h3>{title}</h3>
                    <button onClick={hideModalWindow}>×</button>
                </div>
                <div className="modal-window-body">
                    {content}
                </div>
            </div>
        </div>
    )
}

export default ModalWindow