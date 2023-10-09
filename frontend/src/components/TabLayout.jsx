import React from "react"
import "../styles/TabLayout.css"

const TabLayout = ({ tabLabels, children }) => {
    const [activeTab, setActiveTab] = React.useState(tabLabels[0])

    return (
        <div className="tabLayout">
            <div className="tabLayoutButtonBar">
                {tabLabels.map((label) => {
                    return (
                        <button
                            key={label}
                            className={`tabLayoutButton ${label === activeTab ? "active" : ""}`}
                            onClick={() => setActiveTab(label)}
                        >
                            {label}
                        </button>
                    )
                }
                )}
            </div>
            <div className="tabLayoutContent">
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