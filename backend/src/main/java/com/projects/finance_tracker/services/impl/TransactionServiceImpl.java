package com.projects.finance_tracker.services.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.finance_tracker.dtos.TransactionRequest;
import com.projects.finance_tracker.dtos.TransactionResponse;
import com.projects.finance_tracker.entities.AccountEntity;
import com.projects.finance_tracker.entities.CategoryEntity;
import com.projects.finance_tracker.entities.ContactEntity;
import com.projects.finance_tracker.entities.CurrencyEntity;
import com.projects.finance_tracker.entities.TransactionEntity;
import com.projects.finance_tracker.entities.TransactionTypeEntity;
import com.projects.finance_tracker.entities.UserEntity;
import com.projects.finance_tracker.exceptions.BusinessException;
import com.projects.finance_tracker.exceptions.ResourceNotFoundException;
import com.projects.finance_tracker.repositories.AccountRepository;
import com.projects.finance_tracker.repositories.CategoryRepository;
import com.projects.finance_tracker.repositories.ContactRepository;
import com.projects.finance_tracker.repositories.CurrencyRepository;
import com.projects.finance_tracker.repositories.TransactionRepository;
import com.projects.finance_tracker.repositories.TransactionTypeRepository;
import com.projects.finance_tracker.repositories.UserRepository;
import com.projects.finance_tracker.services.TransactionService;

@Service
public class TransactionServiceImpl implements TransactionService {

    private static final String INCOME = "INCOME";
    private static final String EXPENSE = "EXPENSE";
    private static final String INTERNAL_TRANSFER = "INTERNAL_TRANSFER";

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final ContactRepository contactRepository;
    private final CurrencyRepository currencyRepository;

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            TransactionTypeRepository transactionTypeRepository,
            CategoryRepository categoryRepository,
            AccountRepository accountRepository,
            ContactRepository contactRepository,
            CurrencyRepository currencyRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.transactionTypeRepository = transactionTypeRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
        this.contactRepository = contactRepository;
        this.currencyRepository = currencyRepository;
    }

    @Override
    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        validateAmount(request.amount());

        UserEntity user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TransactionTypeEntity transactionType = transactionTypeRepository.findByCode(request.transactionTypeCode())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction type not found"));
        CurrencyEntity currency = currencyRepository.findById(request.currencyId())
                .orElseThrow(() -> new ResourceNotFoundException("Currency not found"));

        CategoryEntity category = findCategory(request.categoryId(), transactionType);
        AccountEntity sourceAccount = findAccount(request.sourceAccountId(), user);
        AccountEntity destinationAccount = findAccount(request.destinationAccountId(), user);
        ContactEntity sourceContact = findContact(request.sourceContactId(), user);
        ContactEntity destinationContact = findContact(request.destinationContactId(), user);

        applyBalanceMovement(transactionType.getCode(), request.amount(), currency, sourceAccount, destinationAccount);

        TransactionEntity transaction = new TransactionEntity();
        transaction.setUser(user);
        transaction.setTransactionType(transactionType);
        transaction.setCategory(category);
        transaction.setSourceAccount(sourceAccount);
        transaction.setDestinationAccount(destinationAccount);
        transaction.setSourceContact(sourceContact);
        transaction.setDestinationContact(destinationContact);
        transaction.setAmount(request.amount());
        transaction.setCurrency(currency);
        transaction.setTransactionDate(request.transactionDate() == null ? LocalDate.now() : request.transactionDate());
        transaction.setDescription(request.description());
        transaction.setReferenceCode(request.referenceCode());

        return toResponse(transactionRepository.save(transaction));
    }

    @Override
    @Transactional
    public TransactionResponse update(Long id, TransactionRequest request) {
        TransactionEntity transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (transaction.getDeletedAt() != null) {
            throw new BusinessException("Transaction is deleted");
        }

        reverseBalanceMovement(transaction);

        validateAmount(request.amount());

        UserEntity user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TransactionTypeEntity transactionType = transactionTypeRepository.findByCode(request.transactionTypeCode())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction type not found"));
        CurrencyEntity currency = currencyRepository.findById(request.currencyId())
                .orElseThrow(() -> new ResourceNotFoundException("Currency not found"));

        CategoryEntity category = findCategory(request.categoryId(), transactionType);
        AccountEntity sourceAccount = findAccount(request.sourceAccountId(), user);
        AccountEntity destinationAccount = findAccount(request.destinationAccountId(), user);
        ContactEntity sourceContact = findContact(request.sourceContactId(), user);
        ContactEntity destinationContact = findContact(request.destinationContactId(), user);

        applyBalanceMovement(transactionType.getCode(), request.amount(), currency, sourceAccount, destinationAccount);

        transaction.setUser(user);
        transaction.setTransactionType(transactionType);
        transaction.setCategory(category);
        transaction.setSourceAccount(sourceAccount);
        transaction.setDestinationAccount(destinationAccount);
        transaction.setSourceContact(sourceContact);
        transaction.setDestinationContact(destinationContact);
        transaction.setAmount(request.amount());
        transaction.setCurrency(currency);
        transaction.setTransactionDate(request.transactionDate() == null ? LocalDate.now() : request.transactionDate());
        transaction.setDescription(request.description());
        transaction.setReferenceCode(request.referenceCode());

        return toResponse(transactionRepository.save(transaction));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        TransactionEntity transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (transaction.getDeletedAt() != null) {
            return;
        }

        reverseBalanceMovement(transaction);
        transaction.setDeletedAt(LocalDateTime.now());
        transactionRepository.save(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> findAll() {
        return transactionRepository.findByDeletedAtIsNullOrderByTransactionDateDescIdDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> findByUserId(Long userId) {
        return transactionRepository.findByUserIdAndDeletedAtIsNullOrderByTransactionDateDescIdDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> findByFilters(Long userId, Long accountId, String transactionTypeCode) {
        String normalizedTransactionTypeCode = normalizeTransactionTypeCode(transactionTypeCode);

        return transactionRepository.findByFilters(userId, accountId, normalizedTransactionTypeCode).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TransactionResponse> findById(Long id) {
        return transactionRepository.findById(id).map(this::toResponse);
    }

    private void applyBalanceMovement(
            String transactionCode,
            BigDecimal amount,
            CurrencyEntity currency,
            AccountEntity sourceAccount,
            AccountEntity destinationAccount
    ) {
        switch (transactionCode) {
            case INCOME -> applyIncome(amount, currency, destinationAccount);
            case EXPENSE -> applyExpense(amount, currency, sourceAccount);
            case INTERNAL_TRANSFER -> applyInternalTransfer(amount, currency, sourceAccount, destinationAccount);
            default -> throw new BusinessException("Unsupported transaction type: " + transactionCode);
        }
    }

    private void reverseBalanceMovement(TransactionEntity transaction) {
        String transactionCode = transaction.getTransactionType().getCode();
        BigDecimal amount = transaction.getAmount();

        switch (transactionCode) {
            case INCOME -> transaction.getDestinationAccount()
                    .setCurrentBalance(transaction.getDestinationAccount().getCurrentBalance().subtract(amount));
            case EXPENSE -> transaction.getSourceAccount()
                    .setCurrentBalance(transaction.getSourceAccount().getCurrentBalance().add(amount));
            case INTERNAL_TRANSFER -> {
                transaction.getSourceAccount()
                        .setCurrentBalance(transaction.getSourceAccount().getCurrentBalance().add(amount));
                transaction.getDestinationAccount()
                        .setCurrentBalance(transaction.getDestinationAccount().getCurrentBalance().subtract(amount));
            }
            default -> throw new BusinessException("Unsupported transaction type: " + transactionCode);
        }
    }

    private void applyIncome(BigDecimal amount, CurrencyEntity currency, AccountEntity destinationAccount) {
        if (destinationAccount == null) {
            throw new BusinessException("Income requires a destination account");
        }
        validateAccountCurrency(destinationAccount, currency, "Destination account currency must match transaction currency");
        destinationAccount.setCurrentBalance(destinationAccount.getCurrentBalance().add(amount));
    }

    private void applyExpense(BigDecimal amount, CurrencyEntity currency, AccountEntity sourceAccount) {
        if (sourceAccount == null) {
            throw new BusinessException("Expense requires a source account");
        }
        validateAccountCurrency(sourceAccount, currency, "Source account currency must match transaction currency");
        validateSufficientBalance(sourceAccount, amount);
        sourceAccount.setCurrentBalance(sourceAccount.getCurrentBalance().subtract(amount));
    }

    private void applyInternalTransfer(
            BigDecimal amount,
            CurrencyEntity currency,
            AccountEntity sourceAccount,
            AccountEntity destinationAccount
    ) {
        if (sourceAccount == null || destinationAccount == null) {
            throw new BusinessException("Internal transfer requires source and destination accounts");
        }
        if (sourceAccount.getId().equals(destinationAccount.getId())) {
            throw new BusinessException("Source and destination accounts must be different");
        }

        validateAccountCurrency(sourceAccount, currency, "Source account currency must match transaction currency");
        validateAccountCurrency(destinationAccount, currency, "Destination account currency must match transaction currency");
        validateSufficientBalance(sourceAccount, amount);

        sourceAccount.setCurrentBalance(sourceAccount.getCurrentBalance().subtract(amount));
        destinationAccount.setCurrentBalance(destinationAccount.getCurrentBalance().add(amount));
    }

    private CategoryEntity findCategory(Long categoryId, TransactionTypeEntity transactionType) {
        if (categoryId == null) {
            return null;
        }

        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getTransactionType().getId().equals(transactionType.getId())) {
            throw new BusinessException("Category does not belong to the transaction type");
        }

        return category;
    }

    private AccountEntity findAccount(Long accountId, UserEntity user) {
        if (accountId == null) {
            return null;
        }

        AccountEntity account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Account does not belong to the user");
        }
        if (account.getDeletedAt() != null || Boolean.FALSE.equals(account.getIsActive())) {
            throw new BusinessException("Account is not active");
        }

        return account;
    }

    private ContactEntity findContact(Long contactId, UserEntity user) {
        if (contactId == null) {
            return null;
        }

        ContactEntity contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        if (!contact.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Contact does not belong to the user");
        }
        if (contact.getDeletedAt() != null || Boolean.FALSE.equals(contact.getIsActive())) {
            throw new BusinessException("Contact is not active");
        }

        return contact;
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than zero");
        }
    }

    private void validateSufficientBalance(AccountEntity sourceAccount, BigDecimal amount) {
        if (sourceAccount.getCurrentBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient account balance");
        }
    }

    private String normalizeTransactionTypeCode(String transactionTypeCode) {
        if (transactionTypeCode == null || transactionTypeCode.isBlank()) {
            return null;
        }

        return transactionTypeCode.trim().toUpperCase();
    }

    private void validateAccountCurrency(AccountEntity account, CurrencyEntity currency, String message) {
        if (!account.getCurrency().getId().equals(currency.getId())) {
            throw new BusinessException(message);
        }
    }

    private TransactionResponse toResponse(TransactionEntity transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getUser().getId(),
                transaction.getTransactionType().getCode(),
                getId(transaction.getCategory()),
                getName(transaction.getCategory()),
                getId(transaction.getSourceAccount()),
                getName(transaction.getSourceAccount()),
                getId(transaction.getDestinationAccount()),
                getName(transaction.getDestinationAccount()),
                getId(transaction.getSourceContact()),
                getName(transaction.getSourceContact()),
                getId(transaction.getDestinationContact()),
                getName(transaction.getDestinationContact()),
                transaction.getAmount(),
                transaction.getCurrency().getId(),
                transaction.getCurrency().getCode(),
                transaction.getTransactionDate(),
                transaction.getDescription(),
                transaction.getReferenceCode(),
                transaction.getCreatedAt()
        );
    }

    private Long getId(CategoryEntity category) {
        return category == null ? null : category.getId();
    }

    private String getName(CategoryEntity category) {
        return category == null ? null : category.getName();
    }

    private Long getId(AccountEntity account) {
        return account == null ? null : account.getId();
    }

    private String getName(AccountEntity account) {
        return account == null ? null : account.getName();
    }

    private Long getId(ContactEntity contact) {
        return contact == null ? null : contact.getId();
    }

    private String getName(ContactEntity contact) {
        return contact == null ? null : contact.getName();
    }
}
