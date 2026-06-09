package com.projects.finance_tracker.services;

import java.util.List;

import com.projects.finance_tracker.dtos.CatalogItemResponse;
import com.projects.finance_tracker.dtos.CategoryResponse;
import com.projects.finance_tracker.dtos.CurrencyResponse;

public interface CatalogService {

    List<CurrencyResponse> findCurrencies();

    List<CatalogItemResponse> findAccountTypes();

    List<CatalogItemResponse> findTransactionTypes();

    List<CatalogItemResponse> findContactTypes();

    List<CategoryResponse> findCategories();
}
