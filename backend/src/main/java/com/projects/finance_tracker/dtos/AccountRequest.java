package com.projects.finance_tracker.dtos;

import java.math.BigDecimal;

public record AccountRequest(
        Long userId,
        Long accountTypeId,
        Long currencyId,
        String name,
        String description,
        BigDecimal initialBalance
) {
}
