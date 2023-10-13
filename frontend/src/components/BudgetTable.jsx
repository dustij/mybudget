import React from "react"
import FormInput from "./FormInput"
import BudgetEditForm from "./BudgetEditForm"
import { useFlashMessage } from "../hooks/useFlashMessage"
import { useModalWindow } from "../hooks/useModalWindow"
import * as currencyUtils from "../modules/currencyUtils"
import * as dateUtils from "../modules/dateUtils"
import * as selectionUtils from "../modules/selectionUtils"
import "../styles/BudgetTable.css"

// TODO: add loading spinner while fetching data
export const BudgetTable = ({ props }) => {
    const [startDate, setStartDate] = React.useState(dateUtils.formatDate(new Date()))
    const [endDate, setEndDate] = React.useState(dateUtils.formatDate(dateUtils.getNext30Days()[30]))
    const [data, setData] = React.useState([])
    const [dataChanged, setDataChanged] = React.useState(false)
    const [selectedRow, setSelectedRow] = React.useState(null)

    React.useEffect(() => {
        fetch(`http://localhost:8000/api/budget?start_date=${startDate}&end_date=${endDate}`)
            .then(response => response.json())
            .then(data => {
                setData(data.dataframe)
            })
            .then(() => {
                if (dataChanged) {
                    setDataChanged(false)
                }
            })
    }, [dataChanged, startDate, endDate])


    const handleMinus1Day = () => {
        const newStartDate = new Date(`${startDate}T12:00:00.000Z`)
        newStartDate.setDate(newStartDate.getDate() - 1)
        setStartDate(dateUtils.formatDate(newStartDate))
    }

    const handlePlus1Day = () => {
        const newEndDate = new Date(`${endDate}T12:00:00.000Z`)
        newEndDate.setDate(newEndDate.getDate() + 1)
        setEndDate(dateUtils.formatDate(newEndDate))
    }

    const handle30Days = () => {
        setStartDate(dateUtils.formatDate(new Date()))
        setEndDate(dateUtils.formatDate(dateUtils.getNext30Days()[30]))
    }

    const handle60Days = () => {
        setStartDate(dateUtils.formatDate(new Date()))
        setEndDate(dateUtils.formatDate(dateUtils.getNext60Days()[60]))
    }

    const handle90Days = () => {
        setStartDate(dateUtils.formatDate(new Date()))
        setEndDate(dateUtils.formatDate(dateUtils.getNext90Days()[90]))
    }

    const handle365Days = () => {
        setStartDate(dateUtils.formatDate(new Date()))
        setEndDate(dateUtils.formatDate(dateUtils.getNext365Days()[365]))
    }

    return (
        <div className="budget-table">
            <div className="budget-toolbar">
                <FormInput
                    id="start-date"
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={e => dateUtils.isValidDate(e.target.value) && setStartDate(e.target.value)} />
                <FormInput
                    id="end-date"
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={e => dateUtils.isValidDate(e.target.value) && setEndDate(e.target.value)} />
                <button className="toolbar-button" onClick={handleMinus1Day}>-1 Day</button>
                <button className="toolbar-button" onClick={handlePlus1Day}>+1 Day</button>
                <button className="toolbar-button" onClick={handle30Days}>30 Days</button>
                <button className="toolbar-button" onClick={handle60Days}>60 Days</button>
                <button className="toolbar-button" onClick={handle90Days}>90 Days</button>
                <button className="toolbar-button" onClick={handle365Days}>365 Days</button>
            </div>
            <div className="scroll-content">
                <table>
                    <thead>
                        <tr>
                            <th>Weekday</th>
                            <th>Date</th>
                            <th className="number-column">Fixed</th>
                            <th className="number-column">Variable</th>
                            <th className="number-column">Discretionary</th>
                            <th className="number-column">Income</th>
                            <th className="number-column">Savings</th>
                            <th className="number-column">Total</th>
                            <th className="number-column">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dateUtils.getDatesBetween(startDate, endDate).map(date => {
                            const balance = data.filter(row => row.date === dateUtils.formatDate(date))[0]?.balance ||
                                data.filter(row => row.date < dateUtils.formatDate(date))
                                    .sort((a, b) => a.date < b.date ? 1 : -1)[0]?.balance || 0
                            return (
                                <Row
                                    key={date}
                                    date={date}
                                    data={data}
                                    balance={balance}
                                    selected={selectedRow === dateUtils.formatDate(date)}
                                    onRowClick={(e) => setSelectedRow(e)}
                                    dataChanged={dataChanged}
                                    setDataChanged={setDataChanged}
                                />)
                        })}
                    </tbody>
                </table>
            </div>
        </div>

    )
}

const Row = ({ date, data, balance, selected, onRowClick, dataChanged, setDataChanged }) => {
    const [details, setDetails] = React.useState(null)

    React.useEffect(() => {
        setDetails(data.filter(row => row.date === dateUtils.formatDate(date))[0])
    }, [dataChanged])

    const handleClick = () => {
        if (selected) {
            onRowClick(null)
            setDetails(null)
        } else {
            onRowClick(dateUtils.formatDate(date))
            setDetails(data.filter(row => row.date === dateUtils.formatDate(date))[0])
        }
    }

    return (
        <React.Fragment>
            <tr className={selected ? "selected" : ""} onClick={handleClick}>
                <td>{dateUtils.getWeekday(date)}</td>
                <td>{dateUtils.formatDate(date)}</td>
                <td className="fixed number-column"
                    style={
                        {
                            color: Math.abs(
                                data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Fixed || 0
                            ) === 0 ? "#ccc" : ""
                        }
                    }>
                    {
                        currencyUtils.formatCurrency(Math.abs(
                            data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Fixed || 0
                        ))
                    }
                </td>
                <td className="variable number-column"
                    style={
                        {
                            color: Math.abs(
                                data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Variable || 0
                            ) === 0 ? "#ccc" : ""
                        }
                    }>
                    {
                        currencyUtils.formatCurrency(Math.abs(
                            data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Variable || 0
                        ))
                    }
                </td>
                <td className="discretionary number-column"
                    style={
                        {
                            color: Math.abs(
                                data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Discretionary || 0
                            ) === 0 ? "#ccc" : ""
                        }
                    }>
                    {
                        currencyUtils.formatCurrency(Math.abs(
                            data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Discretionary || 0
                        ))
                    }
                </td>
                <td className="income number-column"
                    style={
                        {
                            color: Math.abs(
                                data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Income || 0
                            ) === 0 ? "#ccc" : ""
                        }
                    }>
                    {
                        currencyUtils.formatCurrency(Math.abs(
                            data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Income || 0
                        ))
                    }
                </td>
                <td className="savings number-column"
                    style={
                        {
                            color: Math.abs(
                                data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Savings || 0
                            ) === 0 ? "#ccc" : ""
                        }
                    }>
                    {
                        currencyUtils.formatCurrency(Math.abs(
                            data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Savings || 0
                        ))
                    }
                </td>
                <td className="total number-column"
                    style={
                        {
                            color: (
                                data.filter(row => row.date === dateUtils.formatDate(date))[0]?.row_total || 0
                            ) === 0 ? "#ccc" : ""
                        }
                    }>
                    {
                        currencyUtils.formatCurrency(
                            data.filter(row => row.date === dateUtils.formatDate(date))[0]?.row_total || 0
                        )
                    }
                </td>
                <td className={`number-column ${balance < 0 ? "balance-negative" : "balance"}`}>{
                    currencyUtils.formatCurrency(balance)
                }
                </td>
            </tr>
            {selected && <tr className="details-row">
                <td colSpan="9">
                    <RowDetails date={date} details={details} dataChanged={dataChanged} setDataChanged={setDataChanged} />
                </td>
            </tr>}
        </React.Fragment>
    )
}

// TODO: add styling to a budget edit, add button to revert edit back to rule for that date
const RowDetails = ({ date, details, dataChanged, setDataChanged }) => {
    const { showMessage } = useFlashMessage()
    const { showModalWindow, hideModalWindow } = useModalWindow()
    const rowRefs = React.useRef([])
    const [selectedCategories, setSelectedCategories] = React.useState([])
    const [selectedRows, setSelectedRows] = React.useState([])
    const [parsedDetails, setParsedDetails] = React.useState(details)

    React.useEffect(() => {
        if (!details) {
            return
        }

        // combine the categories list and budget_edits list, use budget_edits amount if both lists share the same category id
        let categories = details.categories.map(category => {
            const budget_edit = details.budget_edits.find(budget_edit => budget_edit.category.id === category.id)
            if (budget_edit) {
                return {
                    ...category,
                    amount: budget_edit.amount
                }
            } else {
                return category
            }
        })

        // add to categories list any budget_edits that are not in the categories list
        let budget_edits = details.budget_edits.filter(budget_edit => !categories.find(category => category.id === budget_edit.category.id))

        // remove any budget_edits that have a $0 amount and are not in the categories list
        // note: categories with a rule that have $0 budget_edit amount will still be shown in details, this is intentional
        budget_edits = budget_edits.filter(budget_edit => budget_edit.amount !== "0.00")

        categories = categories.concat(budget_edits.map(budget_edit => {
            return {
                ...budget_edit.category,
                amount: budget_edit.amount
            }
        }))

        setParsedDetails({
            ...details,
            categories: categories
        })
    }, [details])

    React.useEffect(() => {
        if (!dataChanged) {
            return
        }
        clearSelection()
    }, [dataChanged])

    React.useEffect(() => {
        setSelectedCategories(
            rowRefs.current.filter((_, index) => selectedRows.includes(index))
                .map(row => parsedDetails.categories.find(category => category.name === row.children[1].innerText))
        )
    }, [selectedRows])

    const clearSelection = () => {
        setSelectedRows([])
        setSelectedCategories([])
    }

    const handleAddClick = () => {
        showModalWindow({
            title: "Add Budget Edit",
            content: (
                <BudgetEditForm
                    date={date}
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
        console.log("Edit")
    }

    const handleDeleteClick = () => {
        const handleConfirmDelete = () => {
            // filter out selected categories that are not budget edits

            const selectedBudgetEdits = selectedCategories.map(category => {
                return details.budget_edits.find(budget_edit => budget_edit.category.id === category.id)
            })
            
            fetch("http://localhost:8000/api/budget-edit-batch-delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedBudgetEdits)
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok")
                    }

                    showMessage(`Deleted ${selectedCategories.length} budget edit(s).`, "success")
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
            title: "Confirm Delete",
            content: (
                <div>
                    <p>Are you sure you want to delete the selected budget edit(s)?</p>
                    <div className="modal-window-button-bar">
                        <button className="modal-window-button delete" onClick={handleConfirmDelete}>Delete</button>
                        <button className="modal-window-button" onClick={hideModalWindow} >Cancel</button>
                    </div>
                </div>
            )
        })

    }

    return (
        <div className="details">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Category</th>
                        <th className="number-column">Fixed</th>
                        <th className="number-column">Variable</th>
                        <th className="number-column">Discretionary</th>
                        <th className="number-column">Income</th>
                        <th className="number-column">Savings</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {parsedDetails?.group_totals && Object.keys(parsedDetails.categories).map((category, index) => {
                        const amount = parsedDetails.categories[category]?.amount
                        return (
                            <tr
                                key={category}
                                className={selectedRows.includes(index) ? "selected" : ""}
                                onMouseDown={
                                    (event) => selectionUtils.handleMouseDown(
                                        event, index, selectedRows, setSelectedRows, clearSelection)
                                }
                                ref={rowRef => rowRefs.current[index] = rowRef}
                            >
                                <td></td>
                                <td>{parsedDetails.categories[category]?.name}</td>
                                <td
                                    className="fixed number-column"
                                    style={
                                        {
                                            color: parsedDetails.categories[category]?.group === "Fixed" ?
                                                amount ? "" : "#ccc" : "#ccc"
                                        }}>
                                    {
                                        currencyUtils.formatCurrency(
                                            parsedDetails.categories[category]?.group === "Fixed" ? amount : 0
                                        )
                                    }
                                </td>
                                <td
                                    className="variable number-column"
                                    style={
                                        {
                                            color: parsedDetails.categories[category]?.group === "Variable" ?
                                                amount ? "" : "#ccc" : "#ccc"
                                        }}>
                                    {
                                        currencyUtils.formatCurrency(
                                            parsedDetails.categories[category]?.group === "Variable" ? amount : 0
                                        )
                                    }
                                </td>
                                <td
                                    className="discretionary number-column"
                                    style={
                                        {
                                            color: parsedDetails.categories[category]?.group === "Discretionary" ?
                                                amount ? "" : "#ccc" : "#ccc"
                                        }}>
                                    {
                                        currencyUtils.formatCurrency(
                                            parsedDetails.categories[category]?.group === "Discretionary" ? amount : 0
                                        )
                                    }
                                </td>
                                <td
                                    className="income number-column"
                                    style={
                                        {
                                            color: parsedDetails.categories[category]?.group === "Income" ?
                                                amount ? "" : "#ccc" : "#ccc"
                                        }}>
                                    {
                                        currencyUtils.formatCurrency(
                                            parsedDetails.categories[category]?.group === "Income" ? amount : 0
                                        )
                                    }
                                </td>
                                <td
                                    className="savings number-column"
                                    style={
                                        {
                                            color: parsedDetails.categories[category]?.group === "Savings" ?
                                                amount ? "" : "#ccc" : "#ccc"
                                        }}>
                                    {
                                        currencyUtils.formatCurrency(
                                            parsedDetails.categories[category]?.group === "Savings" ? amount : 0
                                        )
                                    }
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div className="details-footer">
                <div className="button-bar">
                    <button className="button" onClick={handleAddClick}>Add</button>
                    <button className="button" disabled={selectedCategories.length !== 1} onClick={handleEditClick}>Edit</button>
                    <button className="button" disabled={selectedCategories.length === 0} onClick={handleDeleteClick}>Delete</button>
                </div>
            </div>
        </div>
    )
}
