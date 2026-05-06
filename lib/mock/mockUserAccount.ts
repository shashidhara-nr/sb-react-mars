export const mockUserAccount = {
  "columns": [
    "userAccountName",
    "userAccountId",
    "userName",
    "adminRole",
    "authorisationClass",
    {
        "key": "status",
        "type": "status"
      },
      {
        "key": "link",
        "type": "link"
      }
  ],
  "headCells": [
    { "id": "userAccountName", "label": "User account name", "numeric": false },
    { "id": "userAccountId", "label": "User account ID", "numeric": false },
    { "id": "userName", "label": "User name", "numeric": false },
    { "id": "adminRole", "label": "Admin role", "numeric": false },
    { "id": "authorisationClass", "label": "Authorisation class", "numeric": false },
   { "id": "status", "label": "Status", "numeric": false },
            { "id": "link", "label": "Quick Links", "numeric": false }
  ],
  "rows": [
    {
      "userAccountName": "Account A",
      "userAccountId": "U001",
      "userName": "John Doe",
      "adminRole": "Self administrator",
      "authorisationClass": "A",
      "statusLabel": "Active",
      "statusTheme": "info",
       "status": { "value": "Need action", "color": "warning" },
            "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },

      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account B",
      "userAccountId": "U002",
      "userName": "Jane Smith",
      "adminRole": "Administrator",
      "authorisationClass": "B",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Rejected",
      "statusTheme": "warning",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account C",
      "userAccountId": "U003",
      "userName": "Alice Johnson",
      "adminRole": "Self administrator",
      "authorisationClass": "C",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Active",
      "statusTheme": "info",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account D",
      "userAccountId": "U004",
      "userName": "Bob Lee",
      "adminRole": "Administrator",
      "authorisationClass": "A",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Rejected",
      "statusTheme": "warning",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account E",
      "userAccountId": "U005",
      "userName": "Charlie Kim",
      "adminRole": "Self administrator",
      "authorisationClass": "B",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Active",
      "statusTheme": "info",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account F",
      "userAccountId": "U006",
      "userName": "Diana Prince",
      "adminRole": "Administrator",
      "authorisationClass": "C",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Active",
      "statusTheme": "info",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account G",
      "userAccountId": "U007",
      "userName": "Ethan Hunt",
      "adminRole": "Self administrator",
      "authorisationClass": "A",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Rejected",
      "statusTheme": "warning",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account H",
      "userAccountId": "U008",
      "userName": "Fiona Gallagher",
      "adminRole": "Administrator",
      "authorisationClass": "B",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Active",
      "statusTheme": "info",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account I",
      "userAccountId": "U009",
      "userName": "George Michael",
      "adminRole": "Self administrator",
      "authorisationClass": "C",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Active",
      "statusTheme": "info",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account J",
      "userAccountId": "U010",
      "userName": "Hannah Brown",
      "adminRole": "Administrator",
      "authorisationClass": "A",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Rejected",
      "statusTheme": "warning",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account K",
      "userAccountId": "U011",
      "userName": "Ian Curtis",
      "adminRole": "Self administrator",
      "authorisationClass": "B",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Active",
      "statusTheme": "info",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account L",
      "userAccountId": "U012",
      "userName": "Julia Stiles",
      "adminRole": "Administrator",
      "authorisationClass": "C",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Active",
      "statusTheme": "info",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account M",
      "userAccountId": "U013",
      "userName": "Kevin Hart",
      "adminRole": "Self administrator",
      "authorisationClass": "A",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Rejected",
      "statusTheme": "warning",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account N",
      "userAccountId": "U014",
      "userName": "Laura Palmer",
      "adminRole": "Administrator",
      "authorisationClass": "B",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Active",
      "statusTheme": "info",
      "link": "MANAGE USER ACCOUNT"
    },
    {
      "userAccountName": "Account O",
      "userAccountId": "U015",
      "userName": "Mike Ross",
      "adminRole": "Self administrator",
      "authorisationClass": "C",
      "status": { "value": "Need action", "color": "warning" },
      "links": { "href": "https://example.com/4", "text": "MANAGE BENEFICIARY" },
      "statusLabel": "Active",
      "statusTheme": "info",
      "quickLinks": "MANAGE USER ACCOUNT"
    }
  ]
}