package com.projects.finance_tracker.services;

import java.util.List;
import java.util.Optional;

import com.projects.finance_tracker.dtos.ContactRequest;
import com.projects.finance_tracker.dtos.ContactResponse;
import com.projects.finance_tracker.dtos.ContactUpdateRequest;

public interface ContactService {

    ContactResponse create(ContactRequest request);

    ContactResponse update(Long id, ContactUpdateRequest request);

    void delete(Long id);

    List<ContactResponse> findAll();

    List<ContactResponse> findByUserId(Long userId);

    Optional<ContactResponse> findById(Long id);
}
