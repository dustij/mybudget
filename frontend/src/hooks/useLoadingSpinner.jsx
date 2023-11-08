import React from "react"
import { LoadingSpinnerContext } from "../context/LoadingSpinnerContext"

export const useLoadingSpinner = () => {
    return React.useContext(LoadingSpinnerContext)
}

