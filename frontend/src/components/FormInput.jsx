import React from "react"
import "../styles/formInput.css"

export const FormInput = (props) => {
    const [focus, setFocus] = React.useState(false)
    const { name, placeholder, label, errorMessage, type, value, onChange, pattern, required } = props

    return (
        <div className="formInput">
            <label>{label}</label>
            <input
                name={name}
                placeholder={placeholder}
                type={type}
                value={value}
                onChange={onChange}
                pattern={pattern}
                required={required}
                onBlur={() => setFocus(true)}
                focused={focus.toString()}
            />
            <span className="error">{errorMessage}</span>
        </div>
    )
}
