package com.projects.finance_tracker.dtos;

public record UserRequest(
        String fullName,
        String email,
        String passwordHash
) {
}
