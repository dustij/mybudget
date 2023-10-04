import React from "react"
import "../styles/formInput.css"

export const FormInput = (props) => {
    const [focus, setFocus] = React.useState(false)
    const { label, errorMessage, ...otherProps } = props;

    return (
        <div className="formInput">
            <label>{label}</label>
            <input {...otherProps} />
            <span className="error">{errorMessage}</span>
        </div>
    )
}
