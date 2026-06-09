package com.projects.finance_tracker.services;

import java.util.List;
import java.util.Optional;

import com.projects.finance_tracker.dtos.AccountRequest;
import com.projects.finance_tracker.dtos.AccountResponse;
import com.projects.finance_tracker.dtos.AccountUpdateRequest;

public interface AccountService {

    AccountResponse create(AccountRequest request);

    AccountResponse update(Long id, AccountUpdateRequest request);

    void delete(Long id);

    List<AccountResponse> findAll();

    List<AccountResponse> findByUserId(Long userId);

    Optional<AccountResponse> findById(Long id);
}
