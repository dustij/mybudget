import React from "react"
import "../styles/formInput.css"

const FormSelect = React.forwardRef((props, ref) => {
    const [focus, setFocus] = React.useState(false)
    const { label, errorMessage, options, ...otherProps } = props

    return (
        <div className="formInput">
            <label htmlFor={props.id}>{label}</label>
            <select
                ref={ref}
                {...otherProps}
                onBlur={() => setFocus(true)}
                focused={focus.toString()}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    )
})

export default FormSelect