import React from 'react'

const CategoryList = () => {
    const [categories, setCategories] = React.useState([])

    React.useEffect(() => {
        fetch("http://localhost:8000/api/category")
            .then(response => response.json())
            .then(data => setCategories(data))
    }, [])

    return (
        <div>
            <h1>Categories</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Group</th>
                        <th>Repeat</th>
                        <th>Start Date</th>
                        <th>Frequency</th>
                        <th>Weekday</th>
                        <th>Day of Month</th>
                        <th>Month of Year</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(category => (
                        <tr key={category.id}>
                            <td>{category.name}</td>
                            <td>{category.amount}</td>
                            <td>{category.group}</td>
                            <td>{category.repeat}</td>
                            <td>{category.start_date}</td>
                            <td>{category.frequency}</td>
                            <td>{category.weekday}</td>
                            <td>{category.day_of_month}</td>
                            <td>{category.month_of_year}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default CategoryList