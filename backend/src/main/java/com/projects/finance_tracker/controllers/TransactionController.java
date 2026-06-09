package com.projects.finance_tracker.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projects.finance_tracker.dtos.TransactionRequest;
import com.projects.finance_tracker.dtos.TransactionResponse;
import com.projects.finance_tracker.exceptions.ResourceNotFoundException;
import com.projects.finance_tracker.services.TransactionService;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@RequestBody TransactionRequest request) {
        TransactionResponse response = transactionService.create(request);
        return ResponseEntity.created(URI.create("/api/transactions/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@PathVariable Long id, @RequestBody TransactionRequest request) {
        return transactionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<TransactionResponse> findByUserId(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) String transactionTypeCode
    ) {
        if (userId == null && accountId == null && transactionTypeCode == null) {
            return transactionService.findAll();
        }
        if (accountId == null && transactionTypeCode == null) {
            return transactionService.findByUserId(userId);
        }
        return transactionService.findByFilters(userId, accountId, transactionTypeCode);
    }

    @GetMapping("/{id}")
    public TransactionResponse findById(@PathVariable Long id) {
        return transactionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }
}
