import React from "react"

export const FlashMessageContext = React.createContext()

export const FlashMessageProvider = ({ children }) => {
    const [flashMessage, setFlashMessage] = React.useState(null)

    const showMessage = (message, type = "success") => {
        setFlashMessage({ message, type })
    }

    const hideMessage = () => {
        setFlashMessage(null)
    }

    return (
        <FlashMessageContext.Provider value={{ flashMessage, showMessage, hideMessage }}>
            {children}
        </FlashMessageContext.Provider>
    )
}