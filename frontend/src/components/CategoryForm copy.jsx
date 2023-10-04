import React from "react"
import { FormInput } from "./FormInput"
import { FormSelect } from "./FormSelect"
import "../styles/categoryForm.css"

export const CategoryForm = ({ method, pk }) => {
    const [values, setValues] = React.useState({
        name: "",
        amount: "",
        group: "Fixed",
        repeat: "No",
        repeatFrequency: "Weekly",
        weekday: "",
        dayOfMonth: "",
        monthOfYear: ""
    })

    const [isRepeat, setIsRepeat] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [errorMessages, setErrorMessages] = React.useState({})
    const [isError, setIsError] = React.useState(false)
    const [fetchMethod, setFetchMethod] = React.useState(method)
    const [fetchPk, setFetchPk] = React.useState(pk)

    const frequency_int = { "Yearly": 0, "Monthly": 1, "Weekly": 2, "Biweekly": 2, "Daily": 3 }
    const weekday_int = { "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6 }


    React.useEffect(() => {
        const url = "http://localhost:8000/api/category"

        switch (fetchMethod) {
            case "GET":
                const getUrl = `${url}/${fetchPk}`
                fetch(getUrl)
                    .then(response => response.json())
                    .then(data => {
                        setValues({
                            name: data.name,
                            amount: data.amount,
                            group: data.group,
                            repeat: data.repeat,
                            repeatFrequency: data.rule ? data.rule.repeat_frequency : "",
                            weekday: data.rule ? data.rule.weekday : "",
                            dayOfMonth: data.rule ? data.rule.day_of_month : "",
                            monthOfYear: data.rule ? data.rule.month_of_year : ""
                        })
                        setIsRepeat(data.repeat === "Yes")
                    })
                    .catch(error => console.log(error))
                    .finally(() => setIsSubmitting(false))
                break

            case "POST":
                const ruleValues = {
                    "": values.repeatFrequency,
                    "": values.weekday,
                    "": values.dayOfMonth,
                    "": values.monthOfYear
                }
                fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(values)
                })
                    .then(response => {
                        if (!response.ok) {
                            if (response.status === 400) {
                                response.json().then(data => {
                                    setErrorMessages(data)
                                    setIsError(true)
                                })
                                return response.json()
                            }
                            return response.json()
                        }
                        return response.json()
                    })
                    .then(data => console.log(data))
                    .catch(error => console.log(error))
                    .finally(() => setIsSubmitting(false))
                break

            case "PUT":
                const putUrl = `${url}/${fetchPk}`
                fetch(putUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(values)
                })
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.log(error))
                    .finally(() => setIsSubmitting(false))
                break

            case "DELETE":
                const deleteUrl = `${url}/${fetchPk}`
                fetch(deleteUrl, {
                    method: "DELETE"
                })
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.log(error))
                    .finally(() => setIsSubmitting(false))
                break

            default:
                break
        }
    }, [method, pk, isSubmitting])

    const inputs = [
        {
            id: 1,
            name: "name",
            placeholder: "Name",
            label: "Name",
            type: "text",
            errorMessage: "Name is required",
            required: true
        },
        {
            id: 2,
            name: "amount",
            placeholder: "Amount",
            label: "Amount",
            type: "number",
            errorMessage: "Amount is required",
            required: true
        },
    ]

    const selects = [
        {
            id: 1,
            name: "group",
            placeholder: "Group",
            label: "Group",
            errorMessage: "Group must be one of: Fixed, Variable, Discretionary, Income, Savings",
            options: ["Fixed", "Variable", "Discretionary", "Income", "Savings"],
            required: true
        },
        {
            id: 2,
            name: "repeat",
            placeholder: "Repeat",
            label: "Repeat",
            options: ["No", "Yes"],
            required: true
        },
    ]

    const repeatSelects = [
        {
            id: 1,
            name: "repeatFrequency",
            placeholder: "Repeat Frequency",
            label: "Repeat Frequency",
            errorMessage: "Repeat Frequency must be one of: Weekly, Biweekly, Monthly, Yearly",
            options: ["Weekly", "Biweekly", "Monthly", "Yearly"],
            required: true
        },
    ]

    const weeklySelects = [
        {
            id: 1,
            name: "weekday",
            placeholder: "Weekday",
            label: "Weekday",
            errorMessage: "Weekday must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
            options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            required: true
        },
    ]

    const monthlySelects = [
        {
            id: 1,
            name: "dayOfMonth",
            placeholder: "Day of Month",
            label: "Day of Month",
            errorMessage: "Day of Month must be between 1 and 31",
            options: [...Array(31).keys()].map(i => i + 1),
            required: true
        },
    ]

    const yearlySelects = [
        {
            id: 1,
            name: "monthOfYear",
            placeholder: "Month of Year",
            label: "Month of Year",
            errorMessage: "Month of Year must be one of: January, February, March, April, May, June, July, August, September, October, November, December",
            options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "November", "December"],
            required: true
        },
        {
            id: 2,
            name: "dayOfMonth",
            placeholder: "Day of Month",
            label: "Day of Month",
            errorMessage: "Day of Month must be between 1 and 31",
            options: [...Array(31).keys()].map(i => i + 1),
            required: true
        },
    ]

    const toTitleCase = (str) => {
        return str.replace(
            /\w\S*/g,
            (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            }
        )
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setFetchMethod("POST")
        setIsSubmitting(true)
    }

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: toTitleCase(e.target.value)
        })
    }

    const handleRepeatChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: e.target.value
        })
        setIsRepeat(e.target.value === "Yes")
    }

    const handleErrorClick = () => {
        setIsError(false)
    }

    return (
        isError ? <ErrorModal errorMessages={errorMessages} onClick={handleErrorClick} /> : (
            <form className="categoryForm" onSubmit={handleSubmit}>
                <h1>Category Form</h1>

                {inputs.map(input => (
                    <FormInput
                        key={input.id}
                        {...input}
                        value={values[input.name]}
                        onChange={handleChange}
                    />
                ))}

                {selects.map(select => (
                    <FormSelect
                        key={select.id}
                        {...select}
                        value={values[select.name]}
                        onChange={handleRepeatChange}
                    />
                ))}

                {isRepeat && (
                    repeatSelects.map(select => (
                        <FormSelect
                            key={select.id}
                            {...select}
                            value={values[select.name]}
                            onChange={handleChange}
                        />
                    ))
                )}

                {isRepeat && values.repeatFrequency === "Weekly" && (
                    weeklySelects.map(select => (
                        <FormSelect
                            key={select.id}
                            {...select}
                            value={values[select.name]}
                            onChange={handleChange}
                        />
                    ))
                )}

                {isRepeat && values.repeatFrequency === "Biweekly" && (
                    weeklySelects.map(select => (
                        <FormSelect
                            key={select.id}
                            {...select}
                            value={values[select.name]}
                            onChange={handleChange}
                        />
                    ))
                )}

                {isRepeat && values.repeatFrequency === "Monthly" && (
                    monthlySelects.map(select => (
                        <FormSelect
                            key={select.id}
                            {...select}
                            value={values[select.name]}
                            onChange={handleChange}
                        />
                    ))
                )}

                {isRepeat && values.repeatFrequency === "Yearly" && (
                    yearlySelects.map(select => (
                        <FormSelect
                            key={select.id}
                            {...select}
                            value={values[select.name]}
                            onChange={handleChange}
                        />
                    ))
                )}

                <button className="btn btn-primary" type="submit">Submit</button>
            </form>
        )
    )
}


export const ErrorModal = ({ errorMessages, onClick }) => {
    console.log(errorMessages)
    return (
        <div className="modal errorModal">
            <h1>Error</h1>
            <p>Please fix the following errors:</p>
            <ul>
                {Object.keys(errorMessages).map((key) => (
                    <li key={key}>{errorMessages[key]}</li>
                ))}
            </ul>
            <button className="btn btn-primary" onClick={onClick}>OK</button>
        </div>
    )
}
