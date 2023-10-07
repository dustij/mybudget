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
        <div className="modalWindow">
            <div className="modalWindowContent">
                <div className="modalWindowTitle">
                    <h3>{title}</h3>
                    <button onClick={hideModalWindow}>×</button>
                </div>
                <div className="modalWindowBody">
                    {content}
                </div>
            </div>
        </div>
    )
}

export default ModalWindow