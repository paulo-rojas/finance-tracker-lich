-- Initial catalog data for finance_tracker.
-- This script is intentionally idempotent so it can be run more than once.

INSERT INTO currencies (code, name, symbol, created_at)
VALUES
    ('PEN', 'Peruvian Sol', 'S/', now()),
    ('USD', 'US Dollar', '$', now()),
    ('EUR', 'Euro', '€', now())
ON CONFLICT (code) DO NOTHING;

INSERT INTO account_types (code, name, description, is_active, created_at)
VALUES
    ('CASH', 'Cash', 'Physical cash account', true, now()),
    ('BANK_ACCOUNT', 'Bank Account', 'Checking or savings bank account', true, now()),
    ('DIGITAL_WALLET', 'Digital Wallet', 'Digital wallet such as Yape, Plin or PayPal', true, now()),
    ('CREDIT_CARD', 'Credit Card', 'Credit card account', true, now())
ON CONFLICT (code) DO NOTHING;

INSERT INTO transaction_types (code, name, description, created_at)
VALUES
    ('INCOME', 'Income', 'Money received from work, sales, gifts or other activities', now()),
    ('EXPENSE', 'Expense', 'Money spent on purchases, payments or obligations', now()),
    ('INTERNAL_TRANSFER', 'Internal Transfer', 'Money moved between own accounts', now())
ON CONFLICT (code) DO NOTHING;

INSERT INTO contact_types (code, name, description, created_at)
VALUES
    ('PERSON', 'Person', 'Individual person such as family, friend or client', now()),
    ('COMPANY', 'Company', 'Company or organization', now()),
    ('STORE', 'Store', 'Store, merchant or service provider', now()),
    ('EMPLOYER', 'Employer', 'Employer or income source', now()),
    ('BANK', 'Bank', 'Bank or financial institution', now()),
    ('OTHER', 'Other', 'Other contact type', now())
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (transaction_type_id, parent_category_id, name, description, is_active, created_at)
SELECT tt.id, NULL, category.name, category.description, true, now()
FROM transaction_types tt
JOIN (
    VALUES
        ('INCOME', 'Salary', 'Salary and payroll income'),
        ('INCOME', 'Freelance', 'Independent work income'),
        ('INCOME', 'Business', 'Business or sales income'),
        ('INCOME', 'Gifts', 'Gifts or money received from others'),
        ('INCOME', 'Investments', 'Investment returns or dividends'),
        ('INCOME', 'Other Income', 'Other income sources'),

        ('EXPENSE', 'Food', 'Food and groceries'),
        ('EXPENSE', 'Housing', 'Rent, mortgage and home expenses'),
        ('EXPENSE', 'Transport', 'Public transport, taxi, fuel or vehicle expenses'),
        ('EXPENSE', 'Utilities', 'Electricity, water, internet and phone bills'),
        ('EXPENSE', 'Health', 'Healthcare, medicine and insurance'),
        ('EXPENSE', 'Education', 'Courses, books and education expenses'),
        ('EXPENSE', 'Entertainment', 'Leisure, subscriptions and entertainment'),
        ('EXPENSE', 'Shopping', 'Clothes, electronics and general purchases'),
        ('EXPENSE', 'Debt Payments', 'Loan, credit card or debt payments'),
        ('EXPENSE', 'Savings', 'Money set aside for savings goals'),
        ('EXPENSE', 'Other Expense', 'Other expenses'),

        ('INTERNAL_TRANSFER', 'Account Transfer', 'Transfers between own accounts'),
        ('INTERNAL_TRANSFER', 'Cash Withdrawal', 'Withdrawal from bank or wallet to cash'),
        ('INTERNAL_TRANSFER', 'Cash Deposit', 'Deposit from cash to bank or wallet')
) AS category(transaction_code, name, description)
    ON category.transaction_code = tt.code
WHERE NOT EXISTS (
    SELECT 1
    FROM categories existing
    WHERE existing.transaction_type_id = tt.id
      AND existing.parent_category_id IS NULL
      AND existing.name = category.name
);

INSERT INTO categories (transaction_type_id, parent_category_id, name, description, is_active, created_at)
SELECT tt.id, parent.id, child.name, child.description, true, now()
FROM transaction_types tt
JOIN categories parent
    ON parent.transaction_type_id = tt.id
JOIN (
    VALUES
        ('EXPENSE', 'Food', 'Groceries', 'Groceries and market purchases'),
        ('EXPENSE', 'Food', 'Restaurants', 'Restaurants, delivery and eating out'),
        ('EXPENSE', 'Food', 'Coffee', 'Coffee shops and snacks'),

        ('EXPENSE', 'Transport', 'Public Transport', 'Bus, train or metro expenses'),
        ('EXPENSE', 'Transport', 'Taxi', 'Taxi and ride-hailing services'),
        ('EXPENSE', 'Transport', 'Fuel', 'Fuel and vehicle energy expenses'),

        ('EXPENSE', 'Utilities', 'Electricity', 'Electricity bill'),
        ('EXPENSE', 'Utilities', 'Water', 'Water bill'),
        ('EXPENSE', 'Utilities', 'Internet', 'Internet service'),
        ('EXPENSE', 'Utilities', 'Phone', 'Mobile or landline phone service'),

        ('EXPENSE', 'Entertainment', 'Subscriptions', 'Streaming, software or membership subscriptions'),
        ('EXPENSE', 'Entertainment', 'Movies and Events', 'Movies, concerts and events'),

        ('INCOME', 'Business', 'Sales', 'Product or service sales'),
        ('INCOME', 'Investments', 'Dividends', 'Dividend income'),
        ('INCOME', 'Investments', 'Interest', 'Interest income')
) AS child(transaction_code, parent_name, name, description)
    ON child.transaction_code = tt.code
   AND child.parent_name = parent.name
WHERE NOT EXISTS (
    SELECT 1
    FROM categories existing
    WHERE existing.transaction_type_id = tt.id
      AND existing.parent_category_id = parent.id
      AND existing.name = child.name
);
