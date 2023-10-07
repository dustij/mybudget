import React from 'react'

export const ModalWindowContext = React.createContext()

export const ModalWindowProvider = ({ children }) => {
    const [modalWindow, setModalWindow] = React.useState(null)

    const showModalWindow = (modalWindow) => {
        setModalWindow(modalWindow)
    }

    const hideModalWindow = () => {
        setModalWindow(null)
    }

    return (
        <ModalWindowContext.Provider value={{ modalWindow, showModalWindow, hideModalWindow }}>
            {children}
        </ModalWindowContext.Provider>
    )
}
