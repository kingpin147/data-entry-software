import wixData from 'wix-data';

let allData = [];       // All data from collection
let displayData = [];   // Currently displayed data (filtered or all)

$w.onReady(function () {

    // Set up table columns (includes Code column)
    $w('#table1').columns = [
        { "id": "name", "dataPath": "name", "label": "Name", "type": "string", "width": 130, "visible": true },
        { "id": "age", "dataPath": "age", "label": "Age", "type": "number", "width": 80, "visible": true },
        { "id": "gender", "dataPath": "gender", "label": "Gender", "type": "string", "width": 110, "visible": true },
        { "id": "city", "dataPath": "city", "label": "City", "type": "string", "width": 130, "visible": true },
        { "id": "code", "dataPath": "code", "label": "Code", "type": "string", "width": 110, "visible": true }
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
        const name = $w('#nameInput').value.trim();
        const age = Number($w('#ageInput').value);
        const gender = $w('#genderInput').value.trim();
        const city = $w('#cityInput').value.trim();
        const code = $w('#codeInput').value.trim();

        // Validate all fields are filled
        if (!name || !age || !gender || !city || !code) {
            $w('#submitStatus').text = "All fields are required.";
            $w('#submitStatus').show();
            return;
        }

        const toInsert = {
            "name": name,
            "age": age,
            "gender": gender,
            "city": city,
            "code": code
        };

        wixData.insert("PeopleData", toInsert)
            .then(() => {
                // Clear all input fields after successful insert
                $w('#nameInput').value = "";
                $w('#ageInput').value = "";
                $w('#genderInput').value = "";
                $w('#cityInput').value = "";
                $w('#codeInput').value = "";

                $w('#submitStatus').text = "Entry added successfully!";
                $w('#submitStatus').show();

                // Reload table to show new entry
                loadTableData();
            })
            .catch((err) => {
                console.error("Error inserting data:", err);
                $w('#submitStatus').text = "Error adding entry. Please try again.";
                $w('#submitStatus').show();
            });
    });

    // ========================
    // DELETE - Search and delete entry by code or name
    // ========================
    $w('#deleteButton').onClick(() => {
        const searchTerm = $w('#deleteInput').value.trim();

        if (!searchTerm) {
            $w('#deleteStatus').text = "Please enter a name or code to delete.";
            $w('#deleteStatus').show();
            return;
        }

        // Search by code OR name
        wixData.query("PeopleData")
            .eq("code", searchTerm)
            .or(
                wixData.query("PeopleData").eq("name", searchTerm)
            )
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    let deletePromises = results.items.map(item =>
                        wixData.remove("PeopleData", item._id)
                    );
                    return Promise.all(deletePromises).then(() => {
                        $w('#deleteStatus').text = results.items.length + " entry(s) deleted successfully!";
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
                (item.name && item.name.toLowerCase().includes(searchTerm)) ||
                (item.code && item.code.toLowerCase().includes(searchTerm))
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
                (item.name && item.name.toLowerCase().includes(searchTerm)) ||
                (item.age && item.age.toString().includes(searchTerm)) ||
                (item.gender && item.gender.toLowerCase().includes(searchTerm)) ||
                (item.city && item.city.toLowerCase().includes(searchTerm)) ||
                (item.code && item.code.toLowerCase().includes(searchTerm))
            );
        });

        $w('#searchStatus').text = displayData.length + " result(s) found.";
        $w('#searchStatus').show();
        $w('#table1').refresh();
    });

    // ========================
    // RESET BUTTON - Show all data again
    // ========================
    $w('#resetButton').onClick(() => {
        $w('#searchInput').value = "";
        $w('#deleteInput').value = "";
        $w('#submitStatus').hide();
        $w('#deleteStatus').hide();
        $w('#searchStatus').hide();
        loadTableData();
    });
});

// ========================
// Load all data from PeopleData collection
// ========================
function loadTableData() {
    wixData.query("PeopleData")
        .limit(1000)
        .find()
        .then((results) => {
            allData = results.items;
            displayData = allData;
            $w('#table1').refresh();
        })
        .catch((err) => {
            console.error("Error loading data:", err);
        });
}
