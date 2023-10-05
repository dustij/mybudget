import React from "react"
import FormInput from "./FormInput"
import FormSelect from "./FormSelect"
import { useFlashMessage } from "../hooks/useFlashMessage"
import { formatDate } from "../modules/dateUtils"
import "../styles/categoryForm.css"

const CategoryForm = (props) => {
    const nameInputRef = React.useRef()
    const { showMessage } = useFlashMessage()
    const [method, setMethod] = React.useState(props.method)
    const [category, setCategory] = React.useState(props.category)
    const [isRepeat, setIsRepeat] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [doneSubmitting, setDoneSubmitting] = React.useState(false)
    const [isError, setIsError] = React.useState(false)
    const [values, setValues] = React.useState({
        name: "",
        amount: "",
        group: "Fixed",
        repeat: "No",
        start_date: formatDate(new Date()),
        frequency: "Weekly",
        weekday: "",
        day_of_month: "",
        month_of_year: ""
    })

    React.useEffect(() => {
        if (isSubmitting) {
            const url = "http://localhost:8000"
            if (method === "POST") {
                if (values.repeat === "No") {
                    postCategory(url + "/api/category", values)
                        .then(data => console.log("RESPONSE DATA:", data))
                        .then(() => setDoneSubmitting(true))
                        .finally(() => setIsSubmitting(false))
                } else {
                    postCategory(url + "/api/rule", {
                        ...values,
                        day_of_month: values.day_of_month ? values.day_of_month : null,
                        month_of_year: values.month_of_year ? values.month_of_year : null
                    })
                        .then(data => {
                            console.log("RESPONSE DATA:", data)

                            return {
                                ...values,
                                rule: data.id
                            }
                        })
                        .then(updatedValues => {
                            console.log(updatedValues)
                            postCategory(url + "/api/category", updatedValues)
                                .then(data => console.log("RESPONSE DATA:", data))
                                .then(() => setDoneSubmitting(true))
                                .finally(() => setIsSubmitting(false))
                        })
                }
            }
        }
    }, [isSubmitting])

    React.useEffect(() => {
        if (doneSubmitting) {
            if (!isError) {
                setValues({
                    name: "",
                    amount: "",
                    group: "Fixed",
                    repeat: "No",
                    start_date: formatDate(new Date()),
                    frequency: "Weekly",
                    weekday: "",
                    day_of_month: "",
                    month_of_year: ""
                })
                setIsRepeat(false)
            }
            setDoneSubmitting(false)
            setIsError(false)
            nameInputRef.current.focus()
        }
    }, [doneSubmitting])

    const postCategory = (url, values) => {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values)
        })
            .then(res => {
                if (res.status === 201) {
                    showMessage("Category created successfully", "success")
                    return res.json()
                } else {
                    return res.json().then(err => {
                        console.log(err)

                        const errString = Object.keys(err).map(key => {
                            return `${err[key]}`
                        }).join(",\n")

                        showMessage(`${errString}`, "error")
                        throw new Error(res.status)
                    })
                }
            })
            .catch(err => setIsError(true))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        console.log("SUBMITTING:", values)
    }

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: toTitleCase(e.target.value)
        })

        if (e.target.name === "repeat") {
            setIsRepeat(e.target.value === "Yes")
        }
    }

    const toTitleCase = (str) => {
        return str.replace(
            /\w\S*/g,
            (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            }
        )
    }

    return (
        <form className="categoryForm" onSubmit={handleSubmit}>
            <h1>Category Form</h1>
            <FormInput
                id="name"
                name="name"
                placeholder="Name"
                label="Name"
                type="text"
                errorMessage="Name is required"
                required={true}
                autoComplete="off"
                autoFocus={true}
                value={values.name}
                onChange={handleChange}
                ref={nameInputRef} />

            <FormSelect
                id="group"
                name="group"
                label="Group"
                options={["Fixed", "Variable", "Discretionary", "Income", "Savings"]}
                value={values.group}
                onChange={handleChange} />

            <FormInput
                id="amount"
                name="amount"
                placeholder="Amount"
                label="Amount"
                type="number"
                step="0.01"
                errorMessage="Amount is required"
                required={true}
                value={values.amount}
                onChange={handleChange} />

            <FormSelect
                id="repeat"
                name="repeat"
                label="Repeat"
                options={["No", "Yes"]}
                value={values.repeat}
                onChange={handleChange} />

            {isRepeat &&
                <FormInput
                    id="startDate"
                    name="start_date"
                    placeholder="Start Date"
                    label="Start Date"
                    type="date"
                    errorMessage="Start Date is required"
                    required={true}
                    value={values.start_date}
                    onChange={handleChange} />
            }

            {isRepeat &&
                <FormSelect
                    id="frequency"
                    name="frequency"
                    label="Repeat Frequency"
                    options={["Weekly", "Biweekly", "Monthly", "Yearly"]}
                    value={values.frequency}
                    onChange={handleChange} />
            }

            {isRepeat && (values.frequency === "Weekly" || values.frequency === "Biweekly") && (
                <FormSelect
                    id="weekday"
                    name="weekday"
                    label="Weekday"
                    options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
                    value={values.weekday}
                    onChange={handleChange} />
            )}

            {isRepeat && (values.frequency === "Monthly" || values.frequency === "Yearly") && (
                <FormInput
                    id="dayOfMonth"
                    name="day_of_month"
                    placeholder="Day of Month"
                    label="Day of Month"
                    type="number"
                    min="1"
                    max="31"
                    errorMessage="Day of Month is required"
                    required={true}
                    value={values.day_of_month}
                    onChange={handleChange} />
            )}

            {isRepeat && values.frequency === "Yearly" && (
                <FormInput
                    id="monthOfYear"
                    name="month_of_year"
                    placeholder="Month of Year"
                    label="Month of Year"
                    type="number"
                    min="1"
                    max="12"
                    errorMessage="Month of Year is required"
                    required={true}
                    value={values.month_of_year}
                    onChange={handleChange} />
            )}

            <button className="btn btn-primary" type="submit">Submit</button>
        </form>
    )
}

export default CategoryForm