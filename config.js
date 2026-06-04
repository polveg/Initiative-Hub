/**
 * Initiative Hub — Configuration
 * ============================================================
 * Edit this file to customize the Hub.
 * ============================================================
 */

const HUB_CONFIG = {

    // Data source: path to the CSV file in the repository
    dataSource: {
        localFile: "data/initiatives.csv",
        cacheDurationMinutes: 5
    },

    // Category → color mapping (new categories get default gray)
    categoryColors: {
        "Cross": { bg: "#E1F4FF", color: "#0070F2" },
        "AI": { bg: "#F0E8FF", color: "#6C3CFF" },
        "Partners": { bg: "#E1F4FF", color: "#1B90FF" },
        "Build": { bg: "#E6F7F5", color: "#00857C" },
        "Mobile": { bg: "#FFF3E0", color: "#E76500" },
        "Integration": { bg: "#E8EDF5", color: "#002A86" }
    },
    defaultCategoryColor: { bg: "#EAECEE", color: "#666666" }
};
