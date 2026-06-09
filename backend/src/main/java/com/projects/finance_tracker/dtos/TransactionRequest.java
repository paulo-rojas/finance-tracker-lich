package com.projects.finance_tracker.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        Long userId,
        String transactionTypeCode,
        Long categoryId,
        Long sourceAccountId,
        Long destinationAccountId,
        Long sourceContactId,
        Long destinationContactId,
        BigDecimal amount,
        Long currencyId,
        LocalDate transactionDate,
        String description,
        String referenceCode
) {
}
