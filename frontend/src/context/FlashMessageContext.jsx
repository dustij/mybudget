import React from "react"

export const FlashMessageContext = React.createContext()

export const FlashMessageProvider = ({ children }) => {
    const [flashMessage, setFlashMessage] = React.useState(null)
    const [prepHide, setPrepHide] = React.useState(false)

    React.useEffect(() => {
        if (flashMessage) {
            setTimeout(() => {
                hideMessage()
            }, 3000)
        }
    }, [flashMessage])

    const showMessage = (message, type = "success") => {
        setFlashMessage({ message, type })
    }

    const hideMessage = () => {
        setPrepHide(true)
        setTimeout(() => {
            setFlashMessage(null)
            setPrepHide(false)
        }, 500)
    }

    return (
        <FlashMessageContext.Provider value={{ flashMessage, showMessage, hideMessage, prepHide }}>
            {children}
        </FlashMessageContext.Provider>
    )
}