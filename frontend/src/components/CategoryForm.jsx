import React from "react"
import FormInput from "./FormInput"
import FormSelect from "./FormSelect"
import { useFlashMessage } from "../hooks/useFlashMessage"
import { formatDate } from "../modules/dateUtils"
import "../styles/categoryForm.css"

const CategoryForm = (props) => {
    const { showMessage } = useFlashMessage()
    const nameInputRef = React.useRef()
    const [method, setMethod] = React.useState(props.method)
    const [category, setCategory] = React.useState(props.category)
    const [isRepeat, setIsRepeat] = React.useState(
        props.category ? props.category.rule ? true : false : false
    )
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [doneSubmitting, setDoneSubmitting] = React.useState(false)
    const [isError, setIsError] = React.useState(false)
    const [values, setValues] = React.useState(
        props.category ? {
            id: category.id,
            name: category.name,
            amount: category.amount,
            group: category.group,
            repeat: category.repeat,
            start_date: category.rule ? category.rule.start_date : formatDate(new Date()),
            frequency: category.rule ? category.rule.frequency : "Weekly",
            weekday: category.rule ? category.rule.weekday : "Monday",
            day_of_month: category.rule ? category.rule.day_of_month : "",
            month_of_year: category.rule ? category.rule.month_of_year : ""
        } : {
            name: "",
            amount: "",
            group: "Fixed",
            repeat: "No",
            start_date: formatDate(new Date()),
            frequency: "Weekly",
            weekday: "Monday",
            day_of_month: "",
            month_of_year: ""
        })


    React.useEffect(() => {
        if (isSubmitting) {
            const url = "http://localhost:8000"

            switch (method) {
                case "POST":
                    if (values.repeat === "No") {
                        postCategory(url + "/api/category", values)
                            .then(() => setDoneSubmitting(true))
                            .finally(() => setIsSubmitting(false))
                    } else {
                        postRule(url + "/api/rule", {
                            ...values,
                            day_of_month: values.day_of_month ? values.day_of_month : null,
                            month_of_year: values.month_of_year ? values.month_of_year : null
                        })
                            .then(data => {
                                return {
                                    ...values,
                                    rule: data.id
                                }
                            })
                            .then(updatedValues => {
                                postCategory(url + "/api/category", updatedValues)
                                    .then(() => setDoneSubmitting(true))
                                    .finally(() => setIsSubmitting(false))
                            })
                    }
                    break

                case "PUT":
                    if (values.repeat === "No") {
                        putCategory(url + "/api/category/" + category.id, values)
                            .then(() => setDoneSubmitting(true))
                            .finally(() => setIsSubmitting(false))
                    } else {
                        postRule(url + "/api/rule", {
                            ...values,
                            day_of_month: values.day_of_month ? values.day_of_month : null,
                            month_of_year: values.month_of_year ? values.month_of_year : null
                        })
                            .then(data => {
                                return {
                                    ...values,
                                    rule: data.id
                                }
                            })
                            .then(updatedValues => {
                                putCategory(url + "/api/category/" + category.id, updatedValues)
                                    .then(() => setDoneSubmitting(true))
                                    .finally(() => setIsSubmitting(false))
                            })
                    }
                    break

                default:
                    break
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
            props.onSubmit()
        }
    }, [doneSubmitting])

    const postRule = (url, values) => {
        const cleanedValues = { ...values }

        if (values.frequency === "Weekly" || values.frequency === "Biweekly") {
            cleanedValues.day_of_month = null
            cleanedValues.month_of_year = null
        } else if (values.frequency === "Monthly") {
            cleanedValues.weekday = null
            cleanedValues.month_of_year = null
        } else if (values.frequency === "Yearly") {
            cleanedValues.weekday = null
        } else {
            cleanedValues.weekday = null
            cleanedValues.day_of_month = null
            cleanedValues.month_of_year = null
        }

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cleanedValues)
        })
            .then(res => {
                if (res.status === 201) {
                    showMessage("Rule created successfully", "success")
                    return res.json()
                } else {
                    return res.json().then(err => {

                        const errString = Object.keys(err).map(key => {
                            return `${err[key]}`
                        }).join(",\n")

                        showMessage(`${errString}`, "error")
                        throw new Error(res.status)
                    })
                }
            })
            .catch(() => setIsError(true))
    }

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
            .catch(() => setIsError(true))
    }

    const putCategory = (url, values) => {
        return fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values)
        })
            .then(res => {
                if (res.status === 200) {
                    showMessage("Category updated successfully", "success")
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
            .catch(() => setIsError(true))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)
    }

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.name]: toTitleCase(e.target.value)
        })

        if (e.target.name === "repeat") {
            setIsRepeat(e.target.value === "Yes")
            if (e.target.value === "No") {
                setValues({
                    ...values,
                    [e.target.name]: toTitleCase(e.target.value),
                    rule: null
                })
            }
        }
    }

    const toTitleCase = (str) => {
        return str.replace(
            /(?:^|\s|-|\/)\w/g,
            (match) => {
                return match.toUpperCase();
            }
        )
    }

    return (
        <form className="category-form" onSubmit={handleSubmit}>
            <div className="category-form-content">
                <div className="primar-form">
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
                </div>

                {isRepeat &&
                    <div className="secondaryForm">
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

                        <FormSelect
                            id="frequency"
                            name="frequency"
                            label="Repeat Frequency"
                            options={["Weekly", "Biweekly", "Monthly", "Yearly"]}
                            value={values.frequency}
                            onChange={handleChange} />

                        {(values.frequency === "Weekly" || values.frequency === "Biweekly") &&
                            <FormSelect
                                id="weekday"
                                name="weekday"
                                label="Weekday"
                                options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
                                value={values.weekday}
                                onChange={handleChange} />
                        }

                        {(values.frequency === "Monthly" || values.frequency === "Yearly") &&
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
                        }

                        {values.frequency === "Yearly" &&
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
                        }
                    </div>
                }
            </div>

            <div className="form-button-bar">
                <button className="submit" type="submit">Submit</button>
                <button type="button" onClick={props.onClick}>Cancel</button>
            </div>
        </form>
    )
}

export default CategoryForm