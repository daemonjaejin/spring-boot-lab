package com.example.demo.dto;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.example.demo.entity.Member;
import lombok.Data;

@Data
public class MemberDto {
    private Long id;
    private String username;
    private String password;
    private String name;
    private String role;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public static MemberDto from(Member m) {
        MemberDto d = new MemberDto();
        d.setId(m.getId());
        d.setUsername(m.getUsername());
        d.setName(m.getName());
        d.setRole(m.getRole());
        // Instant -> LocalDateTime 변환 (시스템 기본 시간대 기준)
        if (m.getCreatedAt() != null) {
            d.setCreated_at(LocalDateTime.ofInstant(m.getCreatedAt(), ZoneId.systemDefault()));
        }
        if (m.getUpdatedAt() != null) {
            d.setUpdated_at(LocalDateTime.ofInstant(m.getUpdatedAt(), ZoneId.systemDefault()));
        }
        return d;
    }
}
