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

import com.projects.finance_tracker.dtos.ContactRequest;
import com.projects.finance_tracker.dtos.ContactResponse;
import com.projects.finance_tracker.dtos.ContactUpdateRequest;
import com.projects.finance_tracker.exceptions.ResourceNotFoundException;
import com.projects.finance_tracker.services.ContactService;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<ContactResponse> create(@RequestBody ContactRequest request) {
        ContactResponse response = contactService.create(request);
        return ResponseEntity.created(URI.create("/api/contacts/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ContactResponse update(@PathVariable Long id, @RequestBody ContactUpdateRequest request) {
        return contactService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<ContactResponse> findByUserId(@RequestParam(required = false) Long userId) {
        if (userId == null) {
            return contactService.findAll();
        }
        return contactService.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ContactResponse findById(@PathVariable Long id) {
        return contactService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
    }
}
