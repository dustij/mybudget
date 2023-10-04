import React from "react"
import { FormInput } from "./FormInput"
import { FormSelect } from "./FormSelect"
import { formatDate } from "../modules/dateUtils"
import "../styles/categoryForm.css"

export const CategoryForm = (props) => {
    const [method, setMethod] = React.useState(props.method)
    const [category, setCategory] = React.useState(props.category)
    const [isRepeat, setIsRepeat] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
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
        document.getElementsByName("name")[0].focus()
    }, [])

    React.useEffect(() => {
        if (isSubmitting) {
            const url = "http://localhost:8000"
            if (method === "POST") {
                if (values.repeat === "No") {
                    fetch(url + "/api/category", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(values)
                    })
                        .then(res => res.json())
                        .then(data => console.log(data))
                        .finally(() => { setIsSubmitting(false) })
                } else {
                    fetch(url + "/api/rule", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            ...values,
                            day_of_month: values.day_of_month ? values.day_of_month : null,
                            month_of_year: values.month_of_year ? values.month_of_year : null
                        })
                    })
                        .then(res => res.json())
                        .then(data => {
                            console.log(data)

                            return {
                                ...values,
                                rule: data.id
                            }
                        })
                        .then(updatedValues => {
                            console.log(updatedValues)
                            fetch(url + "/api/category", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(updatedValues)
                            })
                                .then(res => res.json())
                                .then(data => console.log(data))
                                .finally(() => { setIsSubmitting(false) })
                        })
                }
            }
        }
    }, [isSubmitting])

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
                name="name"
                placeholder="Name"
                label="Name"
                type="text"
                errorMessage="Name is required"
                required={true}
                value={values.name}
                onChange={handleChange} />

            <FormSelect
                name="group"
                label="Group"
                options={["Fixed", "Variable", "Discretionary", "Income", "Savings"]}
                value={values.group}
                onChange={handleChange} />

            <FormInput
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
                name="repeat"
                label="Repeat"
                options={["No", "Yes"]}
                value={values.repeat}
                onChange={handleChange} />

            {isRepeat &&
                <FormInput
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
                    name="frequency"
                    label="Repeat Frequency"
                    options={["Weekly", "Biweekly", "Monthly", "Yearly"]}
                    value={values.frequency}
                    onChange={handleChange} />
            }

            {isRepeat && (values.frequency === "Weekly" || values.frequency === "Biweekly") && (
                <FormSelect
                    name="weekday"
                    label="Weekday"
                    options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
                    value={values.weekday}
                    onChange={handleChange} />
            )}

            {isRepeat && (values.frequency === "Monthly" || values.frequency === "Yearly") && (
                <FormInput
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