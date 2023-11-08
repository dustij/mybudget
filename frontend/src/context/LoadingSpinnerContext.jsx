import React from 'react'

export const LoadingSpinnerContext = React.createContext()

export const LoadingSpinnerProvider = ({ children }) => {
    const [loadingSpinner, setLoadingSpinner] = React.useState(true)

    const showLoadingSpinner = () => {
        setLoadingSpinner(true)
    }

    const hideLoadingSpinner = () => {
        setLoadingSpinner(false)
    }

    return (
        <LoadingSpinnerContext.Provider value={{ loadingSpinner, showLoadingSpinner, hideLoadingSpinner }}>
            {children}
        </LoadingSpinnerContext.Provider>
    )
}
