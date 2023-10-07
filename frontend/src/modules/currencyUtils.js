export const formatCurrency = (amount) => {
    const USD = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    })
    return USD.format(amount)
}