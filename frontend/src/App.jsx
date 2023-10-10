import React from "react"
import { FlashMessageProvider } from "./context/FlashMessageContext"
import { ModalWindowProvider } from "./context/ModalWindowContext"
import FlashMessage from "./components/FlashMessage"
import ModalWindow from "./components/ModalWindow"
import TabLayout from "./components/TabLayout"
import CategoryTable from "./components/CategoryTable"
import { BudgetTable } from "./components/BudgetTable"
import "./styles/App.css"

const App = () => {
    return (
        <FlashMessageProvider>
            <ModalWindowProvider>
                <div className="app" tabIndex={0} role="application">
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
        <div className="app-content">
            <TabLayout tabLabels={["Budget", "Categories"]}>
                <CategoryTable label={"Categories"} />
                <BudgetTable label={"Budget"} />
            </TabLayout>
        </div>
    )
}

export default App