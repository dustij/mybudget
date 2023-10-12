import React from "react"
import CategoryForm from "./CategoryForm"
import { useFlashMessage } from "../hooks/useFlashMessage"
import { useModalWindow } from "../hooks/useModalWindow"
import { formatCurrency } from "../modules/currencyUtils"
import * as selectionUtils from "../modules/selectionUtils"
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
            rowRefs.current.filter((_, index) => selectedRows.includes(index))
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
            fetch("http://localhost:8000/api/category-batch", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedCategories)
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok")
                    }

                    showMessage(`Deleted ${selectedCategories.length} category(s).`, "success")
                    setDataChanged(true)
                    hideModalWindow()
                })
                .catch((error) => {
                    showMessage(error.message, "error")
                })
                .finally(() => {
                    clearSelection()
                })
        }

        showModalWindow({
            title: "Delete Category(s)",
            content: (
                <div>
                    <p>Are you sure you want to delete the selected category(s)?</p>
                    <p>This action cannot be undone.</p>
                    <div className="modal-window-button-bar">
                        <button className="modal-window-button delete" onClick={handleConfirmDelete}>Delete</button>
                        <button className="modal-window-button" onClick={hideModalWindow} >Cancel</button>
                    </div>
                </div>
            )
        })
    }

    return (
        <div className="category-table">
            <div className="category-toolbar">
                <button className="toolbar-button" onClick={handleAddClick}>Add</button>
                <button className="toolbar-button" disabled={selectedCategories.length !== 1} onClick={handleEditClick}>Edit</button>
                <button className="toolbar-button" disabled={selectedCategories.length === 0} onClick={handleDeleteClick}>Delete</button>
            </div>
            <div className="scroll-content">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th className="number-column">Amount</th>
                            <th>Group</th>
                            <th>Repeat</th>
                            <th>Start Date</th>
                            <th>Frequency</th>
                            <th>Weekday</th>
                            <th className="number-column">Day of Month</th>
                            <th className="number-column">Month of Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category, index) => (
                            <tr
                                key={category.id}
                                className={selectedRows.includes(index) ? "selected" : ""}
                                onMouseDown={
                                    (event) => selectionUtils.handleMouseDown(
                                        event, index, selectedRows, setSelectedRows, clearSelection)
                                }
                                ref={rowRef => rowRefs.current[index] = rowRef}
                            >
                                <td>{category.name}</td>
                                <td className="number-column">{formatCurrency(category.amount)}</td>
                                <td>{category.group}</td>
                                <td>{category.repeat}</td>
                                <td>{category.rule && category.rule.start_date}</td>
                                <td>{category.rule && category.rule.frequency}</td>
                                <td>{category.rule && category.rule.weekday}</td>
                                <td className="number-column">{category.rule && category.rule.day_of_month}</td>
                                <td className="number-column">{category.rule && category.rule.month_of_year}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CategoryTable