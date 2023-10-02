import React from 'react'
import '../styles/formInput.css'

export const FormSelect = (props) => {
    const [focus, setFocus] = React.useState(false)
    const { name, placeholder, label, errorMessage, options, value, onChange, required } = props

    return (
        <div className="formInput">
            <label>{label}</label>
            <select
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                onBlur={() => setFocus(true)}
                focused={focus.toString()}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <span className="error">{errorMessage}</span>
        </div>
    )
}
