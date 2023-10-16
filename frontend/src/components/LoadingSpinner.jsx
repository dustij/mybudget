import React from "react"
import { useLoadingSpinner } from "../hooks/useLoadingSpinner"
import "../styles/LoadingSpinner.css"

const LoadingSpinner = () => {
    const { loadingSpinner, hideLoadingSpinner } = useLoadingSpinner()

    if (!loadingSpinner) {
        return null
    }

    return (
        <div className="loading-spinner">
            <div className="loading-spinner-content">
                <div className="loading-spinner-title">
                    <h3>Loading...</h3>
                </div>
                <div className="loading-spinner-body">
                    <div className="loading-spinner-animation">
                        <div className="loading-spinner-animation-content">
                            <div className="loading-spinner-animation-content-inner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadingSpinner