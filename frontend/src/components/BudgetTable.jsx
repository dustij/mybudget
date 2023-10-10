import React from "react"
import FormInput from "./FormInput"
import * as dateUtils from "../modules/dateUtils"
import "../styles/BudgetTable.css"

export const BudgetTable = ({ props }) => {
    const [startDate, setStartDate] = React.useState(dateUtils.formatDate(new Date()))
    const [endDate, setEndDate] = React.useState(dateUtils.formatDate(dateUtils.getNext30Days()[30]))
    const [dataChanged, setDataChanged] = React.useState(true)

    React.useEffect(() => {}, [dataChanged, startDate, endDate])

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
                            <th className="number-column">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dateUtils.getDatesBetween(startDate, endDate).map(date => (
                            <tr key={date}>
                                <td>{dateUtils.getWeekday(date)}</td>
                                <td>{dateUtils.formatDate(date)}</td>
                                <td className="number-column"></td>
                                <td className="number-column"></td>
                                <td className="number-column"></td>
                                <td className="number-column"></td>
                                <td className="number-column"></td>
                                <td className="number-column"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    )
}
