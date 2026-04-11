package com.nexussupport.dto;
import com.nexussupport.domain.entity.User;
import java.time.LocalDateTime;
public record UserDto(Long userId, String name, LocalDateTime createdAt) {
    public static UserDto from(User user) { return new UserDto(user.getUserId(), user.getName(), user.getCreatedAt()); }
}
