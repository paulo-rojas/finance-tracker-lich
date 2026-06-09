package com.projects.finance_tracker.services.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.finance_tracker.dtos.AccountRequest;
import com.projects.finance_tracker.dtos.AccountResponse;
import com.projects.finance_tracker.dtos.AccountUpdateRequest;
import com.projects.finance_tracker.entities.AccountEntity;
import com.projects.finance_tracker.entities.AccountTypeEntity;
import com.projects.finance_tracker.entities.CurrencyEntity;
import com.projects.finance_tracker.entities.UserEntity;
import com.projects.finance_tracker.exceptions.BusinessException;
import com.projects.finance_tracker.exceptions.ResourceNotFoundException;
import com.projects.finance_tracker.repositories.AccountRepository;
import com.projects.finance_tracker.repositories.AccountTypeRepository;
import com.projects.finance_tracker.repositories.CurrencyRepository;
import com.projects.finance_tracker.repositories.UserRepository;
import com.projects.finance_tracker.services.AccountService;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final CurrencyRepository currencyRepository;

    public AccountServiceImpl(
            AccountRepository accountRepository,
            UserRepository userRepository,
            AccountTypeRepository accountTypeRepository,
            CurrencyRepository currencyRepository
    ) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountTypeRepository = accountTypeRepository;
        this.currencyRepository = currencyRepository;
    }

    @Override
    @Transactional
    public AccountResponse create(AccountRequest request) {
        if (isBlank(request.name())) {
            throw new BusinessException("Account name is required");
        }

        UserEntity user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AccountTypeEntity accountType = accountTypeRepository.findById(request.accountTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Account type not found"));
        CurrencyEntity currency = currencyRepository.findById(request.currencyId())
                .orElseThrow(() -> new ResourceNotFoundException("Currency not found"));

        BigDecimal initialBalance = request.initialBalance() == null ? BigDecimal.ZERO : request.initialBalance();

        AccountEntity account = new AccountEntity();
        account.setUser(user);
        account.setAccountType(accountType);
        account.setCurrency(currency);
        account.setName(request.name().trim());
        account.setDescription(request.description());
        account.setInitialBalance(initialBalance);
        account.setCurrentBalance(initialBalance);
        account.setIsActive(true);

        return toResponse(accountRepository.save(account));
    }

    @Override
    @Transactional
    public AccountResponse update(Long id, AccountUpdateRequest request) {
        AccountEntity account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getDeletedAt() != null) {
            throw new BusinessException("Account is deleted");
        }
        if (isBlank(request.name())) {
            throw new BusinessException("Account name is required");
        }

        AccountTypeEntity accountType = accountTypeRepository.findById(request.accountTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Account type not found"));

        account.setAccountType(accountType);
        account.setName(request.name().trim());
        account.setDescription(request.description());
        account.setIsActive(request.isActive() == null ? account.getIsActive() : request.isActive());

        return toResponse(accountRepository.save(account));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        AccountEntity account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        account.setIsActive(false);
        account.setDeletedAt(LocalDateTime.now());
        accountRepository.save(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> findAll() {
        return accountRepository.findByDeletedAtIsNullOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> findByUserId(Long userId) {
        return accountRepository.findByUserIdAndDeletedAtIsNullOrderByNameAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AccountResponse> findById(Long id) {
        return accountRepository.findById(id).map(this::toResponse);
    }

    private AccountResponse toResponse(AccountEntity account) {
        return new AccountResponse(
                account.getId(),
                account.getUser().getId(),
                account.getAccountType().getId(),
                account.getAccountType().getName(),
                account.getCurrency().getId(),
                account.getCurrency().getCode(),
                account.getName(),
                account.getDescription(),
                account.getInitialBalance(),
                account.getCurrentBalance(),
                account.getIsActive()
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
