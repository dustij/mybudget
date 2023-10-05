import React from "react"
import CategoryForm from "./components/CategoryForm"
import { FlashMessageProvider } from "./context/FlashMessageContext"
import "./styles/App.css"
import FlashMessage from "./components/FlashMessage"

const App = () => {
    return (
        <FlashMessageProvider>
            <div className="app">
                <FlashMessage />
                <AppContent />
            </div>
        </FlashMessageProvider>
    )
}

const AppContent = () => {
    return (
        <div className="appContent">
            <CategoryForm method={"POST"} />
        </div>
    )
}

export default App