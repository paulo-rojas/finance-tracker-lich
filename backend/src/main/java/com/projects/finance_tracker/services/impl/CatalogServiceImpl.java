package com.projects.finance_tracker.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.finance_tracker.dtos.CatalogItemResponse;
import com.projects.finance_tracker.dtos.CategoryResponse;
import com.projects.finance_tracker.dtos.CurrencyResponse;
import com.projects.finance_tracker.entities.AccountTypeEntity;
import com.projects.finance_tracker.entities.CategoryEntity;
import com.projects.finance_tracker.entities.ContactTypeEntity;
import com.projects.finance_tracker.entities.CurrencyEntity;
import com.projects.finance_tracker.entities.TransactionTypeEntity;
import com.projects.finance_tracker.repositories.AccountTypeRepository;
import com.projects.finance_tracker.repositories.CategoryRepository;
import com.projects.finance_tracker.repositories.ContactTypeRepository;
import com.projects.finance_tracker.repositories.CurrencyRepository;
import com.projects.finance_tracker.repositories.TransactionTypeRepository;
import com.projects.finance_tracker.services.CatalogService;

@Service
public class CatalogServiceImpl implements CatalogService {

    private final CurrencyRepository currencyRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final ContactTypeRepository contactTypeRepository;
    private final CategoryRepository categoryRepository;

    public CatalogServiceImpl(
            CurrencyRepository currencyRepository,
            AccountTypeRepository accountTypeRepository,
            TransactionTypeRepository transactionTypeRepository,
            ContactTypeRepository contactTypeRepository,
            CategoryRepository categoryRepository
    ) {
        this.currencyRepository = currencyRepository;
        this.accountTypeRepository = accountTypeRepository;
        this.transactionTypeRepository = transactionTypeRepository;
        this.contactTypeRepository = contactTypeRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CurrencyResponse> findCurrencies() {
        return currencyRepository.findAll().stream()
                .map(this::toCurrencyResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatalogItemResponse> findAccountTypes() {
        return accountTypeRepository.findAll().stream()
                .map(this::toAccountTypeResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatalogItemResponse> findTransactionTypes() {
        return transactionTypeRepository.findAll().stream()
                .map(this::toTransactionTypeResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatalogItemResponse> findContactTypes() {
        return contactTypeRepository.findAll().stream()
                .map(this::toContactTypeResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> findCategories() {
        return categoryRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    private CurrencyResponse toCurrencyResponse(CurrencyEntity currency) {
        return new CurrencyResponse(currency.getId(), currency.getCode(), currency.getName(), currency.getSymbol());
    }

    private CatalogItemResponse toAccountTypeResponse(AccountTypeEntity accountType) {
        return new CatalogItemResponse(
                accountType.getId(),
                accountType.getCode(),
                accountType.getName(),
                accountType.getDescription()
        );
    }

    private CatalogItemResponse toTransactionTypeResponse(TransactionTypeEntity transactionType) {
        return new CatalogItemResponse(
                transactionType.getId(),
                transactionType.getCode(),
                transactionType.getName(),
                transactionType.getDescription()
        );
    }

    private CatalogItemResponse toContactTypeResponse(ContactTypeEntity contactType) {
        return new CatalogItemResponse(
                contactType.getId(),
                contactType.getCode(),
                contactType.getName(),
                contactType.getDescription()
        );
    }

    private CategoryResponse toCategoryResponse(CategoryEntity category) {
        Long parentId = category.getParentCategory() == null ? null : category.getParentCategory().getId();

        return new CategoryResponse(
                category.getId(),
                parentId,
                category.getTransactionType().getId(),
                category.getTransactionType().getCode(),
                category.getName(),
                category.getDescription(),
                category.getIsActive()
        );
    }
}
