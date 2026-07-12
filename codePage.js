import wixData from 'wix-data';

$w.onReady(function () {
    console.log(">>> codePage onReady started");

    // Hide data container and status text initially
    $w('#data').hide();
    try { $w('#statusText').hide(); } catch (e) {}

    // "Start Now" button
    $w('#startButton').onClick(async () => {
        console.log(">>> Start button clicked");
        const code = $w('#codeInput').value.trim();
        console.log(">>> Code entered:", code);

        if (!code) {
            $w('#data').hide();
            try {
                $w('#statusText').text = "Please enter a code.";
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
            const results = await wixData.query("PeopleData")
                .eq("code", code)
                .find();

            console.log(">>> Items found:", results.items.length);

            if (results.items.length > 0) {
                const item = results.items[0]; // Single entry per code

                // Populate text elements
                $w('#name').text = item.name || "";
                $w('#age').text = String(item.age || "");
                $w('#gender').text = item.gender || "";
                $w('#city').text = item.city || "";

                console.log(">>> Data populated:", item.name, item.age, item.gender, item.city);

                // Show the data container, hide status
                $w('#data').show();
                try { $w('#statusText').hide(); } catch (e) {}
            } else {
                $w('#data').hide();
                try {
                    $w('#statusText').text = "Invalid code. No records found.";
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
