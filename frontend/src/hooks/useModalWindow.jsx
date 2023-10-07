import React from "react"
import { ModalWindowContext } from "../context/ModalWindowContext"

export const useModalWindow = () => {
    return React.useContext(ModalWindowContext)
}

