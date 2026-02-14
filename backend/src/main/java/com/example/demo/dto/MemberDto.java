package com.example.demo.dto;

import com.example.demo.entity.Member;
import lombok.Data;

@Data
public class MemberDto {
    private Long id;
    private String username;
    private String password;
    private String name;
    private String role;

    public static MemberDto from(Member m) {
        MemberDto d = new MemberDto();
        d.setId(m.getId());
        d.setUsername(m.getUsername());
        d.setName(m.getName());
        d.setRole(m.getRole());
        return d;
    }
}
