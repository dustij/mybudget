import React from "react"
import CategoryForm from "./CategoryForm"
import { useFlashMessage } from "../hooks/useFlashMessage"
import { useModalWindow } from "../hooks/useModalWindow"
import { formatCurrency } from "../modules/currencyUtils"
import "../styles/CategoryTable.css"

const CategoryTable = () => {
    const { showMessage } = useFlashMessage()
    const { showModalWindow, hideModalWindow } = useModalWindow()
    const [categories, setCategories] = React.useState([])
    const [selectedCategories, setSelectedCategories] = React.useState([])
    const [dataChanged, setDataChanged] = React.useState(true)

    React.useEffect(() => {
        if (!dataChanged) {
            return
        }

        fetch("http://localhost:8000/api/category")
            .then(response => response.json())
            .then(data => {
                setCategories(data.map(category => {
                    if (category.rule) {
                        return {
                            ...category,
                            ...category.rule
                        }
                    } else {
                        return category
                    }
                }))
            })
            .then(() => {
                clearSelection()
                setDataChanged(false)
            })

    }, [dataChanged])

    const clearSelection = () => {
        const rows = document.querySelectorAll(".categoryTable tbody tr")
        rows.forEach(row => {
            row.classList.remove("selected")
        })
        setSelectedCategories([])
    }

    const handleRowClick = (e) => {
        const row = e.target.parentElement

        if (row.classList.contains("selected")) {
            row.classList.remove("selected")
        } else {
            row.classList.add("selected")
        }

        const name = row.firstChild.innerText
        const category = categories.find(category => category.name === name)
        console.log(category)

        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category))
        } else {
            setSelectedCategories([...selectedCategories, category])
        }
    }

    const handleAddClick = () => {
        showModalWindow({
            title: "Add Category",
            content: (
                <CategoryForm
                    method="POST"
                    onClick={hideModalWindow}
                    onSubmit={() => {
                        setDataChanged(true)
                        hideModalWindow()
                    }} />
            )
        })
    }

    const handleEditClick = () => {
        if (selectedCategories[0].rule) {
            Object.keys(selectedCategories[0].rule).forEach(key => {
                if (selectedCategories[0].rule[key] === null) {
                    selectedCategories[0].rule[key] = ""
                }
            })
        }

        const category = selectedCategories[0]

        showModalWindow({
            title: "Edit Category",
            content: (
                <CategoryForm
                    method="PUT"
                    category={category}
                    onClick={hideModalWindow}
                    onSubmit={() => {
                        setDataChanged(true)
                        hideModalWindow()
                    }} />
            )
        })
    }

    const handleDeleteClick = () => {
        const handleConfirmDelete = () => {
            selectedCategories.forEach(category => {
                console.log(category)
                fetch(`http://localhost:8000/api/category/${category.id}`, {
                    method: "DELETE"
                })
                    .then(response => {
                        if (response.status === 204) {
                            return {
                                success: true
                            }
                        } else if (response.status === 404) {
                            return {
                                success: false,
                                message: "Category not found."
                            }
                        } else {
                            return response.json()
                        }
                    })
                    .then(data => {
                        if (data.success) {
                            setCategories(categories.filter(c => c !== category))
                            setSelectedCategories([])
                            setDataChanged(true)
                            hideModalWindow()
                            showMessage("Category(s) deleted successfully.", "success")

                        } else {
                            throw new Error(data.message)
                        }
                    })
                    .catch(error => {
                        showModalWindow({
                            title: "Error",
                            content: (
                                <div>
                                    <p>An error occurred while deleting the selected category(s).</p>
                                    <p>{error.message}</p>
                                    <div className="modalWindowButtonBar">
                                        <button className="modalWindowButton" onClick={hideModalWindow}>OK</button>
                                    </div>
                                </div>
                            )
                        })
                    })
            })
        }

        showModalWindow({
            title: "Delete Category(s)",
            content: (
                <div>
                    <p>Are you sure you want to delete the selected category(s)?</p>
                    <p>This action cannot be undone.</p>
                    <div className="modalWindowButtonBar">
                        <button className="modalWindowButton delete" onClick={handleConfirmDelete}>Delete</button>
                        <button className="modalWindowButton" onClick={hideModalWindow} >Cancel</button>
                    </div>
                </div>
            )
        })
    }

    return (
        <div className="categoryTable">
            <div className="categoryToolbar">
                <button className="categoryButton" onClick={handleAddClick}>Add</button>
                <button className="categoryButton" disabled={selectedCategories.length !== 1} onClick={handleEditClick}>Edit</button>
                <button className="categoryButton" disabled={selectedCategories.length === 0} onClick={handleDeleteClick}>Delete</button>
            </div>
            <div className="scrollContent">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th className="numberColumn">Amount</th>
                            <th>Group</th>
                            <th>Repeat</th>
                            <th>Start Date</th>
                            <th>Frequency</th>
                            <th>Weekday</th>
                            <th className="numberColumn">Day of Month</th>
                            <th className="numberColumn">Month of Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id} onClick={handleRowClick}>
                                <td>{category.name}</td>
                                <td className="numberColumn">{formatCurrency(category.amount)}</td>
                                <td>{category.group}</td>
                                <td>{category.repeat}</td>
                                <td>{category.start_date}</td>
                                <td>{category.frequency}</td>
                                <td>{category.weekday}</td>
                                <td className="numberColumn">{category.day_of_month}</td>
                                <td className="numberColumn">{category.month_of_year}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CategoryTable