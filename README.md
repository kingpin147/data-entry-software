# Wix Data Entry & Retrieval Software

This repository contains client-side JavaScript code built using **Velo by Wix** to manage and retrieve records in a Wix database collection named `ClientData`.

---

## 📂 Project Structure

- **`codePage.js`** — Logic for the record retrieval page. Visitors enter a **Ref number** to look up all matching records, displayed in a table.
- **`dataentryPage.js`** — Logic for the admin data entry panel (adding, searching, filtering, and deleting records).

---

## 🗄️ Database Schema

The system interacts with a Wix database collection named **`ClientData`**.

| Column Label        | Field Key          | Type     | Notes                                      |
| :------------------ | :----------------- | :------- | :----------------------------------------- |
| **Ref**             | `ref`              | Text     | Unique lookup identifier                   |
| **Client**          | `client`           | Text     | Client name                                |
| **Address**         | `address`          | Text     | Client address                             |
| **Type of Report**  | `typeOfReport`     | Text     | Category/type of the report                |
| **Reporting Period**| `reportingPeriod`  | Text     | Period covered by the report               |
| **Date of Issue**   | `dateOfIssue`      | **Date** | Stored as a Wix Date object; displayed as `YYYY-MM-DD` |
| **Page 5 Footing**  | `page5Footing`     | Text     | Footing content for page 5                 |

> ⚠️ Field keys are **case-sensitive**. Ensure they match exactly in the Wix collection.
> ⚠️ `dateOfIssue` must be a **Date** field (not Text) in the Wix collection.

---

## 🚀 Page Implementations

### 1. Code Lookup Page (`codePage.js`)

Allows visitors to enter a **Ref number** and view **all matching records** in a table.

- **UI Components Required:**

  | Element ID       | Type         | Purpose                                           |
  | :--------------- | :----------- | :------------------------------------------------ |
  | `#codeInput`     | Input field  | User types their Ref number here                  |
  | `#startButton`   | Button       | Triggers the search                               |
  | `#data`          | Container    | Wraps `#resultsTable` (hidden by default)         |
  | `#resultsTable`  | Table        | Displays all records matching the entered Ref     |
  | `#statusText`    | Text element | Shows loading state, errors, or "not found" msg  |

- **Key Functionality:**
  - Queries `ClientData` using `.eq("ref", code)` — returns **all rows** sharing the same Ref.
  - Populates `#resultsTable` via `dataFetcher` (supports virtual paging).
  - Dynamically shows/hides `#data` container based on results.

- **Table Columns in `#resultsTable`:**

  | Label             | dataPath          |
  | :---------------- | :---------------- |
  | Client            | `client`          |
  | Address           | `address`         |
  | Type of Report    | `typeOfReport`    |
  | Reporting Period  | `reportingPeriod` |
  | Date of Issue     | `dateOfIssue`     |
  | Page 5 Footing    | `page5Footing`    |

---

### 2. Admin & Data Entry Page (`dataentryPage.js`)

An administrative control panel to manage all records, with real-time filtering and delete by Ref or Client name.

- **UI Components Required:**

  | Element ID              | Type          | Purpose                                                         |
  | :---------------------- | :------------ | :-------------------------------------------------------------- |
  | `#table1`               | Table         | Displays all records with virtual paging                        |
  | `#refInput`             | Input         | Ref number (unique identifier)                                  |
  | `#clientInput`          | Input         | Client name                                                     |
  | `#addressInput`         | Input         | Address                                                         |
  | `#typeOfReportInput`    | Input         | Type of report                                                  |
  | `#reportingPeriodInput` | Input         | Reporting period                                                |
  | `#dateOfIssueInput`     | Date Picker   | Date of issue — must be a **Date Picker** element               |
  | `#page5FootingInput`    | Input         | Page 5 footing                                                  |
  | `#submitButton`         | Button        | Submits new entry                                               |
  | `#submitStatus`         | Text element  | Shows success/error after submit                                |
  | `#searchInput`          | Input         | Live search across all fields (clearing restores full table)    |
  | `#searchStatus`         | Text element  | Shows result count during search                                |
  | `#deleteInput`          | Input         | Enter Ref **or** Client name to delete (also filters table live)|
  | `#deleteButton`         | Button        | Deletes all records matching Ref or Client name                 |
  | `#deleteStatus`         | Text element  | Lists every deleted record (Ref + Client name)                  |

- **Key Functionality:**
  - **Create:** Validates all 7 fields, then inserts using `wixData.insert`. Date picker value is stored as a native Date object.
  - **Retrieve:** Loads up to 1,000 records; table uses `dataFetcher` for virtual paging. `dateOfIssue` is normalised to `YYYY-MM-DD` on load.
  - **Search:** Instant local filtering across all 7 fields on every keystroke. Clearing the search input automatically restores the full table — no reset button needed.
  - **Delete:** Searches by **Ref** (exact match) **and** by **Client name** (contains), merges unique results, and deletes all matches. The status message lists every deleted record's Ref and Client name, e.g.:
    ```
    2 entry(s) deleted:
    • Ref: A101  |  Client: John Smith
    • Ref: A102  |  Client: John Smith Ltd
    ```

---

## 🛠️ Setup Instructions in Wix

1. **Enable Velo:**
   In the Wix Editor, click **Dev Mode** → **Turn on Dev Mode**.

2. **Create the Database Collection:**
   - Go to the **Databases** tab on the left sidebar.
   - Add a new collection named **`ClientData`**.
   - Add the 7 fields from the schema above, with types matching exactly:
     - `ref`, `client`, `address`, `typeOfReport`, `reportingPeriod`, `page5Footing` → **Text**
     - `dateOfIssue` → **Date** (calendar icon, not Text)
   - Ensure field keys match **exactly** (case-sensitive).

3. **Set Up Pages & Elements:**
   - Create two pages: e.g. **"Lookup"** and **"Admin Portal"**.
   - On the **Lookup** page: add `#codeInput`, `#startButton`, `#statusText`, a container `#data`, and inside it a Table element `#resultsTable`.
   - On the **Admin** page: add all input fields listed above. Use a **Date Picker** element for `#dateOfIssueInput`.

4. **Paste the Code:**
   - Copy `codePage.js` into the page code editor for the **Lookup** page.
   - Copy `dataentryPage.js` into the page code editor for the **Admin** page.

---

## 📝 Changelog

| Change                                     | Details                                                                 |
| :----------------------------------------- | :---------------------------------------------------------------------- |
| Collection renamed                         | `PeopleData` → `ClientData`                                             |
| `dateOfIssue` type corrected               | Changed from Text to **Date**; handled as `Date` object in all operations |
| Date display normalised                    | Date objects formatted to `YYYY-MM-DD` string when loading table        |
| Delete expanded                            | Now searches by **Ref (exact)** or **Client name (contains)**           |
| Delete status improved                     | Lists each deleted record's Ref and Client name                         |
| Reset button removed                       | Clearing the search input already restores the full table               |
| Optimized Table Column Widths              | Standardized column widths to fit viewport without horizontal overflow  |
| Detailed Lookup Notice                     | Replaced generic lookup error message with a detailed multi-line notice |
