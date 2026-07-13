import wixData from 'wix-data';

let allData = [];       // All data from collection
let displayData = [];   // Currently displayed data (filtered or all)

$w.onReady(function () {

    // Set up table columns
    $w('#table1').columns = [
        { "id": "ref",             "dataPath": "ref",             "label": "Ref",               "type": "string", "width": 80,  "visible": true },
        { "id": "client",          "dataPath": "client",          "label": "Client",             "type": "string", "width": 160, "visible": true },
        { "id": "address",         "dataPath": "address",         "label": "Address",            "type": "string", "width": 180, "visible": true },
        { "id": "typeOfReport",    "dataPath": "typeOfReport",    "label": "Type of Report",     "type": "string", "width": 140, "visible": true },
        { "id": "reportingPeriod", "dataPath": "reportingPeriod", "label": "Reporting Period",   "type": "string", "width": 140, "visible": true },
        { "id": "dateOfIssue",     "dataPath": "dateOfIssue",     "label": "Date of Issue",      "type": "string", "width": 120, "visible": true },
        { "id": "page5Footing",    "dataPath": "page5Footing",    "label": "Page 5 Footing",     "type": "string", "width": 140, "visible": true }
    ];

    // Set dataFetcher — the table calls this whenever it needs rows
    $w('#table1').dataFetcher = (startRow, endRow) => {
        return new Promise((resolve) => {
            const pageRows = displayData.slice(startRow, endRow);
            resolve({
                pageRows: pageRows,
                totalRowsCount: displayData.length
            });
        });
    };

    // Hide all status texts initially
    $w('#submitStatus').hide();
    $w('#deleteStatus').hide();
    $w('#searchStatus').hide();

    // Load existing data into table
    loadTableData();

    // ========================
    // SUBMIT - Add new entry
    // ========================
    $w('#submitButton').onClick(() => {
        const ref             = $w('#refInput').value.trim();
        const client          = $w('#clientInput').value.trim();
        const address         = $w('#addressInput').value.trim();
        const typeOfReport    = $w('#typeOfReportInput').value.trim();
        const reportingPeriod = $w('#reportingPeriodInput').value.trim();
        const dateOfIssue     = $w('#dateOfIssueInput').value;   // Date object — no .trim()
        const page5Footing    = $w('#page5FootingInput').value.trim();

        // Validate all fields are filled
        if (!ref || !client || !address || !typeOfReport || !reportingPeriod || !dateOfIssue || !page5Footing) {
            $w('#submitStatus').text = "All fields are required.";
            $w('#submitStatus').show();
            return;
        }

        // Check if Ref number already exists
        wixData.query("ClientData")
            .eq("ref", ref)
            .limit(1)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    $w('#submitStatus').text = "Reference number already exists in database.";
                    $w('#submitStatus').show();
                    return;
                }

                const toInsert = {
                    "ref":             ref,
                    "client":          client,
                    "address":         address,
                    "typeOfReport":    typeOfReport,
                    "reportingPeriod": reportingPeriod,
                    "dateOfIssue":     dateOfIssue,
                    "page5Footing":    page5Footing
                };

                return wixData.insert("ClientData", toInsert)
                    .then(() => {
                        // Clear all input fields after successful insert
                        $w('#refInput').value             = "";
                        $w('#clientInput').value          = "";
                        $w('#addressInput').value         = "";
                        $w('#typeOfReportInput').value    = "";
                        $w('#reportingPeriodInput').value = "";
                        $w('#dateOfIssueInput').value     = null;  // Date picker cleared with null
                        $w('#page5FootingInput').value    = "";

                        $w('#submitStatus').text = "Entry added successfully!";
                        $w('#submitStatus').show();

                        // Reload table to show new entry
                        loadTableData();
                    });
            })
            .catch((err) => {
                console.error("Error inserting data:", err);
                $w('#submitStatus').text = "Error adding entry. Please try again.";
                $w('#submitStatus').show();
            });
    });

    // ========================
    // DELETE - Search and delete entry by Ref OR Client name
    // ========================
    $w('#deleteButton').onClick(() => {
        const searchTerm = $w('#deleteInput').value.trim();

        if (!searchTerm) {
            $w('#deleteStatus').text = "Please enter a Ref or Client name to delete.";
            $w('#deleteStatus').show();
            return;
        }

        // Search by ref (exact) AND by client name (contains), then merge results
        const queryByRef    = wixData.query("ClientData").eq("ref", searchTerm).find();
        const queryByClient = wixData.query("ClientData").contains("client", searchTerm).find();

        Promise.all([queryByRef, queryByClient])
            .then(([refResults, clientResults]) => {
                // Merge unique items by _id
                const allItems = [...refResults.items, ...clientResults.items];
                const uniqueItems = Object.values(
                    allItems.reduce((acc, item) => {
                        acc[item._id] = item;
                        return acc;
                    }, {})
                );

                if (uniqueItems.length > 0) {
                    const deletePromises = uniqueItems.map(item =>
                        wixData.remove("ClientData", item._id)
                    );
                    return Promise.all(deletePromises).then(() => {
                        // Build a summary listing each deleted record
                        const summary = uniqueItems.map(item =>
                            "• Ref: " + (item.ref || "-") + "  |  Client: " + (item.client || "-")
                        ).join("\n");
                        $w('#deleteStatus').text =
                            uniqueItems.length + " entry(s) deleted:\n" + summary;
                        $w('#deleteStatus').show();
                    });
                } else {
                    $w('#deleteStatus').text = "No matching entry found to delete.";
                    $w('#deleteStatus').show();
                }
            })
            .then(() => {
                $w('#deleteInput').value = "";
                loadTableData();
            })
            .catch((err) => {
                console.error("Error deleting data:", err);
                $w('#deleteStatus').text = "Error deleting entry. Please try again.";
                $w('#deleteStatus').show();
            });
    });

    // ========================
    // DELETE INPUT - Filter table as user types (searchable preview)
    // ========================
    $w('#deleteInput').onInput(() => {
        const searchTerm = $w('#deleteInput').value.trim().toLowerCase();

        if (!searchTerm) {
            displayData = allData;
            $w('#table1').refresh();
            return;
        }

        displayData = allData.filter(item => {
            return (
                (item.ref    && item.ref.toLowerCase().includes(searchTerm)) ||
                (item.client && item.client.toLowerCase().includes(searchTerm))
            );
        });

        $w('#table1').refresh();
    });

    // ========================
    // SEARCH BOX - Filter table across all fields
    // ========================
    $w('#searchInput').onInput(() => {
        const searchTerm = $w('#searchInput').value.trim().toLowerCase();

        if (!searchTerm) {
            displayData = allData;
            $w('#table1').refresh();
            $w('#searchStatus').hide();
            return;
        }

        displayData = allData.filter(item => {
            return (
                (item.ref             && item.ref.toLowerCase().includes(searchTerm)) ||
                (item.client          && item.client.toLowerCase().includes(searchTerm)) ||
                (item.address         && item.address.toLowerCase().includes(searchTerm)) ||
                (item.typeOfReport    && item.typeOfReport.toLowerCase().includes(searchTerm)) ||
                (item.reportingPeriod && item.reportingPeriod.toLowerCase().includes(searchTerm)) ||
                (item.dateOfIssue     && item.dateOfIssue instanceof Date && item.dateOfIssue.toLocaleDateString().toLowerCase().includes(searchTerm)) ||
                (item.page5Footing    && item.page5Footing.toLowerCase().includes(searchTerm))
            );
        });

        $w('#searchStatus').text = displayData.length + " result(s) found.";
        $w('#searchStatus').show();
        $w('#table1').refresh();
    });

    // Reset button removed — clearing the search input restores all data automatically
});

// ========================
// Load all data from ClientData collection
// ========================
function loadTableData() {
    wixData.query("ClientData")
        .limit(1000)
        .find()
        .then((results) => {
            // Normalise dateOfIssue: convert Date objects → "YYYY-MM-DD" string
            allData = results.items.map(item => {
                if (item.dateOfIssue instanceof Date) {
                    const d = item.dateOfIssue;
                    const yyyy = d.getFullYear();
                    const mm   = String(d.getMonth() + 1).padStart(2, '0');
                    const dd   = String(d.getDate()).padStart(2, '0');
                    item.dateOfIssue = yyyy + "-" + mm + "-" + dd;
                }
                return item;
            });
            displayData = allData;
            $w('#table1').refresh();
        })
        .catch((err) => {
            console.error("Error loading data:", err);
        });
}
