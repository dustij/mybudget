import React from "react"
import "../styles/TabLayout.css"

const TabLayout = ({ tabLabels, children }) => {
    const [activeTab, setActiveTab] = React.useState(tabLabels[0])

    return (
        <div className="tab-layout">
            <div className="tab-layout-button-bar">
                {tabLabels.map((label) => {
                    return (
                        <button
                            key={label}
                            className={`tab-layout-button ${label === activeTab ? "active" : ""}`}
                            onClick={() => setActiveTab(label)}
                        >
                            {label}
                        </button>
                    )
                }
                )}
            </div>
            <div className="tab-layout-content">
                {React.Children.map(children, (child) => {
                    if (child.props.label === activeTab) {
                        return child
                    }
                })}
            </div>
        </div>
    )
}

export default TabLayout