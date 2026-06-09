package com.projects.finance_tracker.dtos;

public record CatalogItemResponse(
        Long id,
        String code,
        String name,
        String description
) {
}
