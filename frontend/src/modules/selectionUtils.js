export function handleMouseDown(event, index, selectedRows, setSelectedRows, clearSelection) {
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