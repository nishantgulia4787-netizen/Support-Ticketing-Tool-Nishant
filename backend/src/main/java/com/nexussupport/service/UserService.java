package com.nexussupport.service;
import com.nexussupport.dto.CreateUserRequest;
import com.nexussupport.dto.UserDto;
import java.util.List;
public interface UserService {
    UserDto createUser(CreateUserRequest request);
    List<UserDto> getAllUsers();
}
