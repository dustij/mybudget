import React from "react"
import "../styles/formInput.css"

const FormInput = React.forwardRef((props, ref) => {
    const { label, errorMessage, ...otherProps } = props;

    return (
        <div className="form-input">
            <label htmlFor={props.id}>{label}</label>
            <input ref={ref} {...otherProps} />
        </div>
    )
})

export default FormInput