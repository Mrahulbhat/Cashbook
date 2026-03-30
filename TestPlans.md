# Automation Test Plan - Cashbook Application

This document outlines the test scenarios and edge cases to ensure the robust performance and reliability of the Cashbook application.

## 1. Authentication (Login & Signup)
| Feature | Scenario | Type |
| --- | --- | --- |
| Signup | Sign up with valid details (Name, Phone, Password) | Positive |
| Signup | Attempt signup with an existing phone number | Negative |
| Signup | Password validation (Check if < 6 chars is blocked) | Edge Case |
| Login | Log in with correct phone and password | Positive |
| Login | Attempt login with incorrect credentials (wrong phone or password) | Negative |
| Logout | Ensure session is cleared and redirected to login page | Positive |

## 2. Accounts Management
| Feature | Scenario | Type |
| --- | --- | --- |
| Create Account | Create account with valid name and balance | Positive |
| Create Account | Attempt to create account with duplicate name | Negative |
| Create Account | Create account with very long name (UI Truncation check) | Edge Case |
| Update Account | Update both name and balance separately | Positive |
| Delete Account | Delete an account and verify success toast | Positive |

## 3. Categories Management
| Feature | Scenario | Type |
| --- | --- | --- |
| Create Category | Create valid Income/Expense categories | Positive |
| Create Category | Duplicate category name prevention | Negative |
| Create Category | Verify budget limits and validation | Edge Case |
| Delete Category | Remove category and verify system behavior | Positive |

## 4. Transactions & Cash Flow
| Feature | Scenario | Type |
| --- | --- | --- |
| Add Transaction | Add transaction (Income/Expense) and verify balance impact | Positive |
| Add Transaction | Add transaction with Zero amount | Edge Case |
| Add Transaction | Add transaction with a future date | Edge Case |
| Edit Transaction | Change amount/category and verify balance recalculation | Positive |
| Delete Transaction | Remove transaction and ensure account balance reverts | Positive |
| Overdraft | Spend more than account balance (Check if balance goes negative) | Edge Case |

## 5. Transfers
| Feature | Scenario | Type |
| --- | --- | --- |
| Inter-Account | Transfer funds from Bank to Cash | Positive |
| Self-Transfer | Attempt to transfer from Bank to Bank (Same account) | Negative |
| Transfer | Attempt transfer with amount > available balance | Edge Case |

## 6. Dashboards & Analytics
| Feature | Scenario | Type |
| --- | --- | --- |
| Totals | Verify total income/expense cards match transaction aggregates | Positive |
| Filters | Filter by Daily/Monthly/Yearly and verify data updates | Positive |
| Empty State | Verify UI when no transactions exist | Edge Case |

## 7. AI Assistant
| Feature | Scenario | Type |
| --- | --- | --- |
| Query | Ask for "current balance" or "total expense this month" | Positive |
| Invalid Input | Send empty prompt or gibberish text | Negative |
| Contextual | Verify response for finance-specific queries only | Edge Case |
