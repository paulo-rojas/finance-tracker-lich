package com.projects.finance_tracker.services.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.finance_tracker.dtos.UserRequest;
import com.projects.finance_tracker.dtos.UserResponse;
import com.projects.finance_tracker.entities.UserEntity;
import com.projects.finance_tracker.exceptions.BusinessException;
import com.projects.finance_tracker.repositories.UserRepository;
import com.projects.finance_tracker.services.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserResponse create(UserRequest request) {
        if (isBlank(request.fullName()) || isBlank(request.email()) || isBlank(request.passwordHash())) {
            throw new BusinessException("Full name, email and password hash are required");
        }

        userRepository.findByEmail(request.email())
                .ifPresent(user -> {
                    throw new BusinessException("A user with this email already exists");
                });

        UserEntity user = new UserEntity();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim());
        user.setPasswordHash(request.passwordHash());

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> findById(Long id) {
        return userRepository.findById(id).map(this::toResponse);
    }

    private UserResponse toResponse(UserEntity user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getCreatedAt());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
