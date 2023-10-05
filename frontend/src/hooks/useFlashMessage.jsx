import React from "react"
import { FlashMessageContext } from "../context/FlashMessageContext"

export const useFlashMessage = () => {
    return React.useContext(FlashMessageContext)
}