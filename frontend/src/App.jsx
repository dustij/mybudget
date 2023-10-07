import React from "react"
import CategoryTable from "./components/CategoryTable"
import { FlashMessageProvider } from "./context/FlashMessageContext"
import { ModalWindowProvider } from "./context/ModalWindowContext"
import FlashMessage from "./components/FlashMessage"
import ModalWindow from "./components/ModalWindow"
import "./styles/App.css"

const App = () => {
    return (
        <FlashMessageProvider>
            <ModalWindowProvider>
                <div className="app">
                    <FlashMessage />
                    <ModalWindow />
                    <AppContent />
                </div>
            </ModalWindowProvider>
        </FlashMessageProvider>
    )
}

const AppContent = () => {
    return (
        <div className="appContent">
            <CategoryTable />
        </div>
    )
}

export default App