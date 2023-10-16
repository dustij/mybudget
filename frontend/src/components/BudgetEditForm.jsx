import React from "react"
import FormSelect from "./FormSelect"
import FormInput from "./FormInput"
import { useFlashMessage } from "../hooks/useFlashMessage"
import { formatDate } from "../modules/dateUtils"

const BudgetEditForm = (props) => {
    const { showMessage } = useFlashMessage()
    const [values, setValues] = React.useState(
        props.budgetEdit ? {
            date: formatDate(props.date),
            category: props.budgetEdit.category,
            amount: props.budgetEdit.amount
        } : {
        date: formatDate(props.date),
        category: "",
        amount: ""
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [doneSubmitting, setDoneSubmitting] = React.useState(false)
    const [categories, setCategories] = React.useState([])
    const [categoryOptions, setCategoryOptions] = React.useState([])

    React.useEffect(() => {
        setValues({
            ...values,
            category: values.category ? values.category : categoryOptions[0]
        })
    }, [categoryOptions])

    React.useEffect(() => {
        fetch("http://localhost:8000/api/category")
            .then(response => response.json())
            .then(data => {
                setCategories(data)
                setCategoryOptions(data.map(category => category.name).sort(
                    (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
                ))
            })
    }, [])

    React.useEffect(() => {
        if (isSubmitting) {
            fetch("http://localhost:8000/api/budget-edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    date: values.date,
                    category: categories.find(category => category.name === values.category).id,
                    amount: values.amount
                })
            })
                .then(response => {
                    if (response.status === 201) {
                        showMessage("Budget edit added successfully", "success")
                        return response.json()
                    } else {
                        showMessage("Failed to add budget edit", "error")
                    }
                })
                .then(() => setDoneSubmitting(true))
                .finally(() => setIsSubmitting(false))
        }
    }, [isSubmitting])

    React.useEffect(() => {
        if (doneSubmitting) {
            setDoneSubmitting(false)
            props.onSubmit()
        }
    }, [doneSubmitting])


    const handleSubmit = (event) => {
        event.preventDefault()
        setIsSubmitting(true)
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setValues({
            ...values,
            [name]: value
        })
    }

    return (
        <form className="budget-edit-form" onSubmit={handleSubmit}>
            <div className="budget-edit-form-content">
                <div className="primary-form">
                    <FormInput
                        id="date"
                        name="date"
                        placeholder="Date"
                        label="Date"
                        type="date"
                        errorMessage="Date is required"
                        required={true}
                        value={values.date}
                        onChange={handleChange} />

                    <FormSelect
                        id="category"
                        name="category"
                        label="Category"
                        errorMessage="Category is required"
                        required={true}
                        value={values.category}
                        onChange={handleChange}
                        options={categoryOptions} />

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
                </div>
            </div>

            <div className="form-button-bar">
                <button className="submit" type="submit">Submit</button>
                <button type="button" onClick={props.onClick}>Cancel</button>
            </div>
        </form>
    )
}

export default BudgetEditForm