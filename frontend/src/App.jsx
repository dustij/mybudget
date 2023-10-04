import React from "react"
import { CategoryForm } from "./components/CategoryForm"
import "./App.css"

const App = () => {
    return (
        <div className="app">
            <CategoryForm method={"POST"} />
        </div>
    )
}

export default App