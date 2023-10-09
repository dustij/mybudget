import React from "react"
import CategoryForm from "./CategoryForm"
import { useFlashMessage } from "../hooks/useFlashMessage"
import { useModalWindow } from "../hooks/useModalWindow"
import { formatCurrency } from "../modules/currencyUtils"
import "../styles/CategoryTable.css"

const CategoryTable = ({ props }) => {
    const { showMessage } = useFlashMessage()
    const { showModalWindow, hideModalWindow } = useModalWindow()
    const [categories, setCategories] = React.useState([])
    const [selectedCategories, setSelectedCategories] = React.useState([])
    const [selectedRows, setSelectedRows] = React.useState([])
    const [dataChanged, setDataChanged] = React.useState(true)
    const rowRefs = React.useRef([])

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
                            rule: { ...category.rule }
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

    React.useEffect(() => {
        setSelectedCategories(
            rowRefs.current.filter((row, index) => selectedRows.includes(index))
                .map(row => categories.find(category => category.name === row.firstChild.innerText))
        )
    }, [selectedRows])

    const clearSelection = () => {
        setSelectedRows([])
        setSelectedCategories([])
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
            selectedCategories.forEach(async category => {
                try {
                    const response = await fetch(`http://localhost:8000/api/category/${category.id}`, {
                        method: "DELETE"
                    })
                    if (response.status === 204) {
                        setCategories(categories.filter(c => c !== category))
                        setSelectedCategories([])
                        setSelectedRows([])
                        setDataChanged(true)
                        hideModalWindow()
                        showMessage("Category(s) deleted successfully.", "success")
                    } else if (response.status === 404) {
                        throw new Error("Category not found.")
                    } else {
                        const data = await response.json()
                        throw new Error(data.message)
                    }
                }
                catch (error) {
                    showMessage(`An error occurred while deleting the selected category(s). ${error.message}`, "error")
                }
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

    function handleMouseDown(event, index) {
        if (event.button !== 0) return // Only handle left mouse button

        if (event.shiftKey) {
            event.preventDefault()
            // Select range of rows
            const firstIndex = selectedRows.length ? selectedRows[0] : index
            const range = Array(Math.abs(index - firstIndex) + 1)
                .fill()
                .map((_, i) => Math.min(index, firstIndex) + i)
            setSelectedRows(range)
        } else if (event.ctrlKey || event.metaKey) {
            // Toggle individual row
            setSelectedRows((prevSelectedRows) =>
                prevSelectedRows.includes(index)
                    ? prevSelectedRows.filter((i) => i !== index)
                    : [...prevSelectedRows, index]
            )
        } else {
            // Select individual row
            if (selectedRows.length === 1 && selectedRows[0] === index) {
                // Clear selection if row is already selected
                clearSelection()
            } else {
                setSelectedRows([index])
            }
        }
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
                        {categories.map((category, index) => (
                            <tr
                                key={category.id}
                                className={selectedRows.includes(index) ? "selected" : ""}
                                onMouseDown={(event) => handleMouseDown(event, index)}
                                ref={rowRef => rowRefs.current[index] = rowRef}
                            >
                                <td>{category.name}</td>
                                <td className="numberColumn">{formatCurrency(category.amount)}</td>
                                <td>{category.group}</td>
                                <td>{category.repeat}</td>
                                <td>{category.rule && category.rule.start_date}</td>
                                <td>{category.rule && category.rule.frequency}</td>
                                <td>{category.rule && category.rule.weekday}</td>
                                <td className="numberColumn">{category.rule && category.rule.day_of_month}</td>
                                <td className="numberColumn">{category.rule && category.rule.month_of_year}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CategoryTable