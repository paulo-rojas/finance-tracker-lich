package com.projects.finance_tracker.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.finance_tracker.dtos.ContactRequest;
import com.projects.finance_tracker.dtos.ContactResponse;
import com.projects.finance_tracker.dtos.ContactUpdateRequest;
import com.projects.finance_tracker.entities.ContactEntity;
import com.projects.finance_tracker.entities.ContactTypeEntity;
import com.projects.finance_tracker.entities.UserEntity;
import com.projects.finance_tracker.exceptions.BusinessException;
import com.projects.finance_tracker.exceptions.ResourceNotFoundException;
import com.projects.finance_tracker.repositories.ContactRepository;
import com.projects.finance_tracker.repositories.ContactTypeRepository;
import com.projects.finance_tracker.repositories.UserRepository;
import com.projects.finance_tracker.services.ContactService;

@Service
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final ContactTypeRepository contactTypeRepository;

    public ContactServiceImpl(
            ContactRepository contactRepository,
            UserRepository userRepository,
            ContactTypeRepository contactTypeRepository
    ) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
        this.contactTypeRepository = contactTypeRepository;
    }

    @Override
    @Transactional
    public ContactResponse create(ContactRequest request) {
        if (isBlank(request.name())) {
            throw new BusinessException("Contact name is required");
        }

        UserEntity user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ContactTypeEntity contactType = contactTypeRepository.findById(request.contactTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Contact type not found"));

        ContactEntity contact = new ContactEntity();
        contact.setUser(user);
        contact.setContactType(contactType);
        contact.setName(request.name().trim());
        contact.setPhone(request.phone());
        contact.setEmail(request.email());
        contact.setNotes(request.notes());
        contact.setIsActive(true);

        return toResponse(contactRepository.save(contact));
    }

    @Override
    @Transactional
    public ContactResponse update(Long id, ContactUpdateRequest request) {
        ContactEntity contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        if (contact.getDeletedAt() != null) {
            throw new BusinessException("Contact is deleted");
        }
        if (isBlank(request.name())) {
            throw new BusinessException("Contact name is required");
        }

        ContactTypeEntity contactType = contactTypeRepository.findById(request.contactTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Contact type not found"));

        contact.setContactType(contactType);
        contact.setName(request.name().trim());
        contact.setPhone(request.phone());
        contact.setEmail(request.email());
        contact.setNotes(request.notes());
        contact.setIsActive(request.isActive() == null ? contact.getIsActive() : request.isActive());

        return toResponse(contactRepository.save(contact));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ContactEntity contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        contact.setIsActive(false);
        contact.setDeletedAt(LocalDateTime.now());
        contactRepository.save(contact);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactResponse> findAll() {
        return contactRepository.findByDeletedAtIsNullOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactResponse> findByUserId(Long userId) {
        return contactRepository.findByUserIdAndDeletedAtIsNullOrderByNameAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ContactResponse> findById(Long id) {
        return contactRepository.findById(id).map(this::toResponse);
    }

    private ContactResponse toResponse(ContactEntity contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getUser().getId(),
                contact.getContactType().getId(),
                contact.getContactType().getName(),
                contact.getName(),
                contact.getPhone(),
                contact.getEmail(),
                contact.getNotes(),
                contact.getIsActive()
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
