-- Adds stable codes to account_types and contact_types in an existing database.

ALTER TABLE account_types ADD COLUMN IF NOT EXISTS code varchar(30);

UPDATE account_types
SET code = CASE name
    WHEN 'Cash' THEN 'CASH'
    WHEN 'Bank Account' THEN 'BANK_ACCOUNT'
    WHEN 'Digital Wallet' THEN 'DIGITAL_WALLET'
    WHEN 'Credit Card' THEN 'CREDIT_CARD'
    ELSE upper(replace(name, ' ', '_'))
END
WHERE code IS NULL;

ALTER TABLE account_types ALTER COLUMN code SET NOT NULL;
ALTER TABLE account_types ADD CONSTRAINT uk_account_types_code UNIQUE (code);

ALTER TABLE contact_types ADD COLUMN IF NOT EXISTS code varchar(30);

UPDATE contact_types
SET code = CASE name
    WHEN 'Person' THEN 'PERSON'
    WHEN 'Company' THEN 'COMPANY'
    WHEN 'Store' THEN 'STORE'
    WHEN 'Employer' THEN 'EMPLOYER'
    WHEN 'Bank' THEN 'BANK'
    WHEN 'Other' THEN 'OTHER'
    ELSE upper(replace(name, ' ', '_'))
END
WHERE code IS NULL;

ALTER TABLE contact_types ALTER COLUMN code SET NOT NULL;
ALTER TABLE contact_types ADD CONSTRAINT uk_contact_types_code UNIQUE (code);
