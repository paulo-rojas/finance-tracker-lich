package com.projects.finance_tracker.services;

import java.util.List;
import java.util.Optional;

import com.projects.finance_tracker.dtos.TransactionRequest;
import com.projects.finance_tracker.dtos.TransactionResponse;

public interface TransactionService {

    TransactionResponse create(TransactionRequest request);

    TransactionResponse update(Long id, TransactionRequest request);

    void delete(Long id);

    List<TransactionResponse> findAll();

    List<TransactionResponse> findByUserId(Long userId);

    List<TransactionResponse> findByFilters(Long userId, Long accountId, String transactionTypeCode);

    Optional<TransactionResponse> findById(Long id);
}
