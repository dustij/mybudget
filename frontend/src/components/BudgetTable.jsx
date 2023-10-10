import React from "react"
import FormInput from "./FormInput"
import * as dateUtils from "../modules/dateUtils"
import "../styles/BudgetTable.css"

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

    const handleRowClick = (event, index) => {
        if (index === selectedRow) {
            setSelectedRow(null)
            return
        }

        setSelectedRow(index)
    }

    const toCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
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
                        {dateUtils.getDatesBetween(startDate, endDate).map((date, index) => (
                            <tr key={index} className={selectedRow === index ? "selected" : ""} onClick={event => handleRowClick(event, index)}>
                                <td>{dateUtils.getWeekday(date)}</td>
                                <td>{dateUtils.formatDate(date)}</td>
                                <td className="fixed number-column">{
                                    toCurrency(Math.abs(
                                        data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Fixed || 0
                                    ))
                                }</td>
                                <td className="variable number-column">{
                                    toCurrency(Math.abs(
                                        data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Variable || 0
                                    ))
                                }</td>
                                <td className="discretionary number-column">{
                                    toCurrency(Math.abs(
                                        data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Discretionary || 0
                                    ))
                                }</td>
                                <td className="income number-column">{
                                    toCurrency(Math.abs(
                                        data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Income || 0
                                    ))
                                }</td>
                                <td className="savings number-column">{
                                    toCurrency(Math.abs(
                                        data.filter(row => row.date === dateUtils.formatDate(date))[0]?.group_totals.Savings || 0
                                    ))
                                }</td>
                                <td className="total number-column">{
                                    toCurrency(Math.abs(
                                        data.filter(row => row.date === dateUtils.formatDate(date))[0]?.row_total || 0
                                    ))
                                }</td>
                                <td className="balance number-column">{
                                    toCurrency(
                                        data.filter(row => row.date === dateUtils.formatDate(date))[0]?.balance ||
                                        data.filter(row => row.date < dateUtils.formatDate(date))
                                            .sort((a, b) => a.date < b.date ? 1 : -1)[0]?.balance || 0
                                    )
                                }</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    )
}
