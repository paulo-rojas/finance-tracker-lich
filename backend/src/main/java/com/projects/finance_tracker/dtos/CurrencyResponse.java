package com.projects.finance_tracker.dtos;

public record CurrencyResponse(
        Long id,
        String code,
        String name,
        String symbol
) {
}
