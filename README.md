# Wix Data Entry & Retrieval Software

This repository contains client-side JavaScript code built using **Velo by Wix** to manage and retrieve custom records in a Wix database collection named `PeopleData`.

---

## 📂 Project Structure

- **[codePage.js](file:///d:/nouman%20wix%20code/data%20entry%20software/codePage.js)**: Logic for the record retrieval page (querying records via code).
- **[dataentryPage.js](file:///d:/nouman%20wix%20code/data%20entry%20software/dataentryPage.js)**: Logic for the data entry panel (adding, searching, filtering, and deleting records).

---

## 🗄️ Database Schema

The system interacts with a Wix database collection named **`PeopleData`**. Below are the expected field keys and types in the collection:

| Field Name | Field Key | Type | Description |
| :--- | :--- | :--- | :--- |
| **Name** | `name` | Text (`string`) | Person's full name |
| **Age** | `age` | Number (`number`) | Person's age |
| **Gender** | `gender` | Text (`string`) | Person's gender |
| **City** | `city` | Text (`string`) | Person's city of residence |
| **Code** | `code` | Text (`string`) | A unique lookup identifier |

---

## 🚀 Page Implementations

### 1. Code Lookup Page (`codePage.js`)
This page allows visitors to enter a unique lookup code to pull their specific details.

* **UI Components Needed:**
  * `#codeInput`: Input field where the user types their code.
  * `#startButton`: Button that triggers the search.
  * `#data`: Container box holding the text display fields (hidden by default).
  * `#name`, `#age`, `#gender`, `#city`: Text elements displaying matching record details.
  * `#statusText`: Text element displaying loading messages or error/not-found notices.
* **Key Functionality:**
  * Performs a query using `wixData.query("PeopleData").eq("code", code).find()`.
  * Controls visibility states of UI containers dynamically based on data availability.

### 2. Admin & Data Entry Page (`dataentryPage.js`)
An administrative control panel to manage data entries, complete with real-time filtering.

* **UI Components Needed:**
  * **Table:** `#table1` (custom data fetcher implemented for virtual paging).
  * **Insert Form:** `#nameInput`, `#ageInput`, `#genderInput`, `#cityInput`, `#codeInput`, `#submitButton`, and `#submitStatus` (text).
  * **Search & Filter:** `#searchInput`, `#searchStatus` (text).
  * **Deletion:** `#deleteInput` (text input which triggers real-time table filtering), `#deleteButton`, and `#deleteStatus` (text).
  * **Reset:** `#resetButton` (clears all status messages, searches, and resets the table view).
* **Key Functionality:**
  * **Create:** Validates and inserts new records using `wixData.insert`.
  * **Retrieve:** Populates the custom table and implements pagination/slicing via `dataFetcher`.
  * **Search/Filter:** Performs instant local filtering on `allData` arrays to respond to keypress inputs immediately.
  * **Delete:** Searches for records by matching Name OR Code and deletes all matching results using `wixData.remove`.

---

## 🛠️ Setup Instructions in Wix

1. **Enable Velo:**
   In the Wix Editor, click **Dev Mode** in the top menu and select **Turn on Dev Mode**.
2. **Create the Database:**
   * Go to the **Databases** tab on the left sidebar.
   * Add a new collection named **`PeopleData`**.
   * Add the columns corresponding to the schema above (`name`, `age`, `gender`, `city`, `code`). Make sure the field keys match the casing exactly.
3. **Set Up Page Elements:**
   * Create two pages (e.g., "Lookup" and "Admin Portal").
   * Build the UI forms, table, buttons, and text fields matching the IDs defined in the code (e.g., `#submitButton`, `#table1`, etc.).
4. **Copy & Paste Code:**
   * Copy the code from `codePage.js` into the page code editor for your lookup page.
   * Copy the code from `dataentryPage.js` into the page code editor for your admin page.
