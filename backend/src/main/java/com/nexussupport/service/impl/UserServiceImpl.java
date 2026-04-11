package com.nexussupport.service.impl;

import com.nexussupport.domain.entity.User;
import com.nexussupport.dto.CreateUserRequest;
import com.nexussupport.dto.UserDto;
import com.nexussupport.repository.UserRepository;
import com.nexussupport.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByNameIgnoreCase(request.name()))
            throw new IllegalArgumentException("User '" + request.name() + "' already exists.");
        User saved = userRepository.save(new User(request.name()));
        return UserDto.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(UserDto::from).toList();
    }
}
