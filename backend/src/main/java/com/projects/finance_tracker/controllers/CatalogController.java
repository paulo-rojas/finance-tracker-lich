package com.projects.finance_tracker.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projects.finance_tracker.dtos.CatalogItemResponse;
import com.projects.finance_tracker.dtos.CategoryResponse;
import com.projects.finance_tracker.dtos.CurrencyResponse;
import com.projects.finance_tracker.services.CatalogService;

@RestController
@RequestMapping("/api/catalogs")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/currencies")
    public List<CurrencyResponse> findCurrencies() {
        return catalogService.findCurrencies();
    }

    @GetMapping("/account-types")
    public List<CatalogItemResponse> findAccountTypes() {
        return catalogService.findAccountTypes();
    }

    @GetMapping("/transaction-types")
    public List<CatalogItemResponse> findTransactionTypes() {
        return catalogService.findTransactionTypes();
    }

    @GetMapping("/contact-types")
    public List<CatalogItemResponse> findContactTypes() {
        return catalogService.findContactTypes();
    }

    @GetMapping("/categories")
    public List<CategoryResponse> findCategories() {
        return catalogService.findCategories();
    }
}
