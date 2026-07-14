import wixData from 'wix-data';

let resultData = []; // Records found for the searched Ref

$w.onReady(function () {
    console.log(">>> codePage onReady started");

    // Hide data container and status text initially
    $w('#data').hide();
    try { $w('#statusText').hide(); } catch (e) {}

    // Set up table columns
    $w('#resultsTable').columns = [
        { "id": "client",          "dataPath": "client",          "label": "Client",           "type": "string", "width": 140, "visible": true },
        { "id": "address",         "dataPath": "address",         "label": "Address",          "type": "string", "width": 300, "visible": true },
        { "id": "typeOfReport",    "dataPath": "typeOfReport",    "label": "Type of Report",   "type": "string", "width": 130, "visible": true },
        { "id": "reportingPeriod", "dataPath": "reportingPeriod", "label": "Reporting Period", "type": "string", "width": 130, "visible": true },
        { "id": "dateOfIssue",     "dataPath": "dateOfIssue",     "label": "Date of Issue",    "type": "string", "width": 110, "visible": true },
        { "id": "page5Footing",    "dataPath": "page5Footing",    "label": "Page 5 Footing",   "type": "string", "width": 130, "visible": true }
    ];

    // dataFetcher — table calls this whenever it needs rows
    $w('#resultsTable').dataFetcher = (startRow, endRow) => {
        return new Promise((resolve) => {
            const pageRows = resultData.slice(startRow, endRow);
            resolve({
                pageRows: pageRows,
                totalRowsCount: resultData.length
            });
        });
    };

    // "Start Now" button — searches by Ref (unique identifier)
    $w('#startButton').onClick(async () => {
        console.log(">>> Start button clicked");
        const code = $w('#codeInput').value.trim();
        console.log(">>> Ref entered:", code);

        if (!code) {
            $w('#data').hide();
            try {
                $w('#statusText').text = "Please enter a Ref number.";
                $w('#statusText').show();
            } catch (e) {}
            return;
        }

        // Show loading
        $w('#data').hide();
        try {
            $w('#statusText').text = "Loading...";
            $w('#statusText').show();
        } catch (e) {}

        try {
            const results = await wixData.query("ClientData")
                .eq("ref", code)
                .find();

            console.log(">>> Items found:", results.items.length);

            if (results.items.length > 0) {
                // Load ALL matching rows into table and normalise dateOfIssue: convert Date objects → "YYYY-MM-DD" string
                resultData = results.items.map(item => {
                    if (item.dateOfIssue) {
                        const d = new Date(item.dateOfIssue);
                        if (!isNaN(d.getTime())) {
                            const yyyy = d.getFullYear();
                            const mm   = String(d.getMonth() + 1).padStart(2, '0');
                            const dd   = String(d.getDate()).padStart(2, '0');
                            item.dateOfIssue = yyyy + "-" + mm + "-" + dd;
                        }
                    }
                    return item;
                });
                $w('#resultsTable').refresh();

                console.log(">>> Table populated with", resultData.length, "row(s)");

                // Show the data container, hide status
                $w('#data').show();
                try { $w('#statusText').hide(); } catch (e) {}
            } else {
                $w('#data').hide();
                resultData = [];
                try {
                    $w('#statusText').text = `Can't find your report?

Please note that newly issued reports may take up to 3 working days from the date of issuance to appear in our verification system.

If your report is still not available after 3 working days, please contact us at info@bsaccountants.ae so we can review and update our records, if required.`;
                    $w('#statusText').show();
                } catch (e) {}
            }
        } catch (err) {
            console.error(">>> ERROR:", err);
            try {
                $w('#statusText').text = "Something went wrong. Please try again.";
                $w('#statusText').show();
            } catch (e) {}
        }
    });

    console.log(">>> codePage onReady complete");
});
