# Frontend API Guide

This guide contains the backend details needed to build the frontend quickly.

## Base URL

Local backend:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

## All Frontend Endpoints

These are all backend endpoints currently available for the frontend.

### Catalog Endpoints

#### GET /api/catalogs/currencies

Returns all currencies.

Response item:

```json
{
  "id": 1,
  "code": "PEN",
  "name": "Peruvian Sol",
  "symbol": "S/"
}
```

#### GET /api/catalogs/account-types

Returns all account types.

Response item:

```json
{
  "id": 1,
  "code": "CASH",
  "name": "Cash",
  "description": "Physical cash account"
}
```

#### GET /api/catalogs/contact-types

Returns all contact types.

Response item:

```json
{
  "id": 1,
  "code": "PERSON",
  "name": "Person",
  "description": "Individual person such as family, friend or client"
}
```

#### GET /api/catalogs/transaction-types

Returns all transaction types.

Response item:

```json
{
  "id": 1,
  "code": "INCOME",
  "name": "Income",
  "description": "Money received from work, sales, gifts or other activities"
}
```

#### GET /api/catalogs/categories

Returns all active categories.

Response item:

```json
{
  "id": 1,
  "parentCategoryId": null,
  "transactionTypeId": 1,
  "transactionTypeCode": "INCOME",
  "name": "Salary",
  "description": "Salary and payroll income",
  "isActive": true
}
```

Frontend usage:

- Filter by `transactionTypeCode` when creating a transaction.
- Use `parentCategoryId === null` for root categories.
- Use non-null `parentCategoryId` for child categories.

### User Endpoints

#### POST /api/users

Creates a user.

Request:

```json
{
  "fullName": "Paulo Demo",
  "email": "paulo@example.com",
  "passwordHash": "temporary-hash"
}
```

Response:

```json
{
  "id": 1,
  "fullName": "Paulo Demo",
  "email": "paulo@example.com",
  "createdAt": "2026-06-08T01:00:00"
}
```

Notes:

- Authentication is not implemented yet.
- For development, create or select a user and keep its `id` in frontend state.

#### GET /api/users

Returns all users.

Response:

```json
[
  {
    "id": 1,
    "fullName": "Paulo Demo",
    "email": "paulo@example.com",
    "createdAt": "2026-06-08T01:00:00"
  }
]
```

#### GET /api/users/{id}

Returns one user by id.

Path params:

```text
id: number
```

Response:

```json
{
  "id": 1,
  "fullName": "Paulo Demo",
  "email": "paulo@example.com",
  "createdAt": "2026-06-08T01:00:00"
}
```

### Account Endpoints

#### POST /api/accounts

Creates an account.

Request:

```json
{
  "userId": 1,
  "accountTypeId": 3,
  "currencyId": 1,
  "name": "Yape",
  "description": "Main digital wallet",
  "initialBalance": 120.50
}
```

Response:

```json
{
  "id": 1,
  "userId": 1,
  "accountTypeId": 3,
  "accountTypeName": "Digital Wallet",
  "currencyId": 1,
  "currencyCode": "PEN",
  "name": "Yape",
  "description": "Main digital wallet",
  "initialBalance": 120.50,
  "currentBalance": 120.50,
  "isActive": true
}
```

Notes:

- `initialBalance` also becomes `currentBalance`.
- Cash is an account with account type `CASH`.

#### GET /api/accounts?userId={userId}

Returns active, non-deleted accounts for a user.

Query params:

```text
userId: number
```

Response:

```json
[
  {
    "id": 1,
    "userId": 1,
    "accountTypeId": 3,
    "accountTypeName": "Digital Wallet",
    "currencyId": 1,
    "currencyCode": "PEN",
    "name": "Yape",
    "description": "Main digital wallet",
    "initialBalance": 120.50,
    "currentBalance": 220.50,
    "isActive": true
  }
]
```

#### GET /api/accounts

Returns all non-deleted accounts.

Frontend usage:

- Use this for a general accounts table/list.
- For user-specific screens, prefer `GET /api/accounts?userId={userId}`.

Response: same array shape as `GET /api/accounts?userId={userId}`.

#### GET /api/accounts/{id}

Returns one account by id.

Path params:

```text
id: number
```

Response: same shape as account item above.

#### PUT /api/accounts/{id}

Updates account editable fields.

Path params:

```text
id: number
```

Request:

```json
{
  "accountTypeId": 3,
  "name": "Yape Principal",
  "description": "Main digital wallet",
  "isActive": true
}
```

Response: same shape as account item above.

Notes:

- This endpoint does not change `currency`, `initialBalance` or `currentBalance`.
- Use transactions to change account balances.

#### DELETE /api/accounts/{id}

Soft deletes an account.

Path params:

```text
id: number
```

Response:

```text
204 No Content
```

Notes:

- Sets `deletedAt`.
- Sets `isActive = false`.
- Deleted accounts no longer appear in `GET /api/accounts?userId={userId}`.

### Contact Endpoints

#### POST /api/contacts

Creates a contact.

Request:

```json
{
  "userId": 1,
  "contactTypeId": 4,
  "name": "Mi Empresa SAC",
  "phone": null,
  "email": "rrhh@example.com",
  "notes": "Monthly salary source"
}
```

Response:

```json
{
  "id": 1,
  "userId": 1,
  "contactTypeId": 4,
  "contactTypeName": "Employer",
  "name": "Mi Empresa SAC",
  "phone": null,
  "email": "rrhh@example.com",
  "notes": "Monthly salary source",
  "isActive": true
}
```

#### GET /api/contacts?userId={userId}

Returns active, non-deleted contacts for a user.

Query params:

```text
userId: number
```

Response:

```json
[
  {
    "id": 1,
    "userId": 1,
    "contactTypeId": 4,
    "contactTypeName": "Employer",
    "name": "Mi Empresa SAC",
    "phone": null,
    "email": "rrhh@example.com",
    "notes": "Monthly salary source",
    "isActive": true
  }
]
```

#### GET /api/contacts

Returns all non-deleted contacts.

Frontend usage:

- Use this for a general contacts table/list.
- For user-specific screens, prefer `GET /api/contacts?userId={userId}`.

Response: same array shape as `GET /api/contacts?userId={userId}`.

#### GET /api/contacts/{id}

Returns one contact by id.

Path params:

```text
id: number
```

Response: same shape as contact item above.

#### PUT /api/contacts/{id}

Updates contact editable fields.

Path params:

```text
id: number
```

Request:

```json
{
  "contactTypeId": 4,
  "name": "Mi Empresa SAC",
  "phone": "999999999",
  "email": "rrhh@example.com",
  "notes": "Monthly salary source",
  "isActive": true
}
```

Response: same shape as contact item above.

#### DELETE /api/contacts/{id}

Soft deletes a contact.

Path params:

```text
id: number
```

Response:

```text
204 No Content
```

Notes:

- Sets `deletedAt`.
- Sets `isActive = false`.
- Deleted contacts no longer appear in `GET /api/contacts?userId={userId}`.

### Transaction Endpoints

#### POST /api/transactions

Creates a transaction and updates account balances.

Request:

```json
{
  "userId": 1,
  "transactionTypeCode": "EXPENSE",
  "categoryId": 7,
  "sourceAccountId": 1,
  "destinationAccountId": null,
  "sourceContactId": null,
  "destinationContactId": 2,
  "amount": 35.90,
  "currencyId": 1,
  "transactionDate": "2026-06-08",
  "description": "Lunch",
  "referenceCode": null
}
```

Response:

```json
{
  "id": 1,
  "userId": 1,
  "transactionTypeCode": "EXPENSE",
  "categoryId": 7,
  "categoryName": "Food",
  "sourceAccountId": 1,
  "sourceAccountName": "Yape",
  "destinationAccountId": null,
  "destinationAccountName": null,
  "sourceContactId": null,
  "sourceContactName": null,
  "destinationContactId": 2,
  "destinationContactName": "Supermarket",
  "amount": 35.90,
  "currencyId": 1,
  "currencyCode": "PEN",
  "transactionDate": "2026-06-08",
  "description": "Lunch",
  "referenceCode": null,
  "createdAt": "2026-06-08T01:00:00"
}
```

#### GET /api/transactions?userId={userId}

Returns non-deleted transactions for a user, ordered by latest first.

Query params:

```text
userId: number
accountId: number optional
transactionTypeCode: string optional
```

Notes:

- `accountId` returns every transaction where the account participated as source or destination.
- For an account movement/history view, call `GET /api/transactions?userId={userId}&accountId={accountId}`.
- This returns mixed movement types for that account: `INCOME`, `EXPENSE` and `INTERNAL_TRANSFER`.
- To show only internal transfers for an account, add `transactionTypeCode=INTERNAL_TRANSFER`.

Response:

```json
[
  {
    "id": 1,
    "userId": 1,
    "transactionTypeCode": "EXPENSE",
    "categoryId": 7,
    "categoryName": "Food",
    "sourceAccountId": 1,
    "sourceAccountName": "Yape",
    "destinationAccountId": null,
    "destinationAccountName": null,
    "sourceContactId": null,
    "sourceContactName": null,
    "destinationContactId": 2,
    "destinationContactName": "Supermarket",
    "amount": 35.90,
    "currencyId": 1,
    "currencyCode": "PEN",
    "transactionDate": "2026-06-08",
    "description": "Lunch",
    "referenceCode": null,
    "createdAt": "2026-06-08T01:00:00"
  }
]
```

#### GET /api/transactions

Returns all non-deleted transactions, ordered by latest first.

Frontend usage:

- Use this for an admin-style global transaction table.
- For a normal user view, prefer `GET /api/transactions?userId={userId}`.

Response: same array shape as `GET /api/transactions?userId={userId}`.

#### GET /api/transactions/{id}

Returns one transaction by id.

Path params:

```text
id: number
```

Response: same shape as transaction item above.

#### PUT /api/transactions/{id}

Updates a transaction and recalculates balances.

Path params:

```text
id: number
```

Request: same body as `POST /api/transactions`.

Response: same shape as transaction item above.

Important behavior:

- First reverses the old transaction balance movement.
- Then applies the new transaction balance movement.
- Runs inside a database transaction.

#### DELETE /api/transactions/{id}

Soft deletes a transaction and reverses its balance movement.

Path params:

```text
id: number
```

Response:

```text
204 No Content
```

Important behavior:

- `INCOME`: subtracts the amount from the destination account.
- `EXPENSE`: adds the amount back to the source account.
- `INTERNAL_TRANSFER`: adds the amount back to source and subtracts it from destination.
- Sets `deletedAt`.

## Catalog Values

Use these endpoints to populate selects, segmented controls and filters.

```http
GET /api/catalogs/currencies
GET /api/catalogs/account-types
GET /api/catalogs/contact-types
GET /api/catalogs/transaction-types
GET /api/catalogs/categories
```

### Currency Codes

Default values:

```text
PEN - Peruvian Sol - S/
USD - US Dollar - $
EUR - Euro
```

Recommended default currency for Peru-focused UI:

```text
PEN
```

### Account Type Codes

```text
CASH
BANK_ACCOUNT
DIGITAL_WALLET
CREDIT_CARD
```

Suggested UI labels:

```text
CASH           -> Efectivo
BANK_ACCOUNT   -> Cuenta bancaria
DIGITAL_WALLET -> Billetera digital
CREDIT_CARD    -> Tarjeta de credito
```

### Contact Type Codes

```text
PERSON
COMPANY
STORE
EMPLOYER
BANK
OTHER
```

Suggested UI labels:

```text
PERSON   -> Persona
COMPANY  -> Empresa
STORE    -> Comercio
EMPLOYER -> Empleador
BANK     -> Banco
OTHER    -> Otro
```

### Transaction Type Codes

```text
INCOME
EXPENSE
INTERNAL_TRANSFER
```

Suggested UI labels:

```text
INCOME            -> Ingreso
EXPENSE           -> Gasto
INTERNAL_TRANSFER -> Transferencia
```

## Transactions

All transactions require:

```text
userId
transactionTypeCode
amount greater than 0
currencyId
```

If `transactionDate` is omitted, the backend uses today's date.

### Income

Backend rule:

- Requires `destinationAccountId`.
- Adds `amount` to destination account balance.
- `sourceContactId` is optional but recommended to know who paid.

Example:

```json
{
  "userId": 1,
  "transactionTypeCode": "INCOME",
  "categoryId": 1,
  "sourceAccountId": null,
  "destinationAccountId": 1,
  "sourceContactId": 1,
  "destinationContactId": null,
  "amount": 2500.00,
  "currencyId": 1,
  "transactionDate": "2026-06-08",
  "description": "Salary payment",
  "referenceCode": "PAY-2026-06"
}
```

### Expense

Backend rule:

- Requires `sourceAccountId`.
- Subtracts `amount` from source account balance.
- `destinationContactId` is optional but recommended to know who was paid.

Example:

```json
{
  "userId": 1,
  "transactionTypeCode": "EXPENSE",
  "categoryId": 7,
  "sourceAccountId": 1,
  "destinationAccountId": null,
  "sourceContactId": null,
  "destinationContactId": 2,
  "amount": 35.90,
  "currencyId": 1,
  "transactionDate": "2026-06-08",
  "description": "Lunch",
  "referenceCode": null
}
```

### Internal Transfer

Backend rule:

- Requires `sourceAccountId`.
- Requires `destinationAccountId`.
- Source and destination accounts must be different.
- Subtracts from source account and adds to destination account.
- Both accounts must use the same currency as `currencyId`.

Example:

```json
{
  "userId": 1,
  "transactionTypeCode": "INTERNAL_TRANSFER",
  "categoryId": 18,
  "sourceAccountId": 1,
  "destinationAccountId": 2,
  "sourceContactId": null,
  "destinationContactId": null,
  "amount": 100.00,
  "currencyId": 1,
  "transactionDate": "2026-06-08",
  "description": "Move money from Yape to cash",
  "referenceCode": null
}
```

## Suggested Frontend Flow

Start with these screens:

1. User selector/create user.
2. Account list and create account form.
3. Contact list and create contact form.
4. Transaction form.
5. Dashboard with account balances and recent transactions.

For the transaction form:

- If type is `INCOME`, show destination account and optional source contact.
- If type is `EXPENSE`, show source account and optional destination contact.
- If type is `INTERNAL_TRANSFER`, show source account and destination account.
- Filter categories by `transactionTypeCode`.
- Filter accounts by selected currency when possible.

## Useful Defaults

Default currency:

```text
PEN
```

Good starter accounts:

```text
Efectivo    -> CASH
Yape        -> DIGITAL_WALLET
Interbank   -> BANK_ACCOUNT
BCP Visa    -> CREDIT_CARD
```

Good starter contacts:

```text
Employer or client -> EMPLOYER / COMPANY
Supermarket        -> STORE
Bank               -> BANK
Family or friend   -> PERSON
```

## Error Responses

The backend returns errors like:

```json
{
  "status": 400,
  "message": "Internal transfer requires source and destination accounts",
  "timestamp": "2026-06-08T01:00:00"
}
```

Common frontend cases to handle:

```text
400 -> business validation error
404 -> resource not found
500 -> unexpected backend error
```

Show `message` directly in a toast/snackbar while developing.

## Development Note

If the Angular app runs at:

```text
http://localhost:4200
```

the backend may need CORS enabled before browser requests work. Swagger and direct API calls from tools can work even when the browser blocks Angular requests.
