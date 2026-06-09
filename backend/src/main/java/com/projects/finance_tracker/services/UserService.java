package com.projects.finance_tracker.services;

import java.util.List;
import java.util.Optional;

import com.projects.finance_tracker.dtos.UserRequest;
import com.projects.finance_tracker.dtos.UserResponse;

public interface UserService {

    UserResponse create(UserRequest request);

    List<UserResponse> findAll();

    Optional<UserResponse> findById(Long id);
}
