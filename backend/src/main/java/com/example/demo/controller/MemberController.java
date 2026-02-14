package com.example.demo.controller;

import com.example.demo.dto.MemberDto;
import com.example.demo.entity.Member;
import com.example.demo.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberRepository memberRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER','TESTER')")
    public List<MemberDto> list() {
        return memberRepository.findAll().stream().map(MemberDto::from).collect(Collectors.toList());
    }

    @GetMapping("/me")
    public MemberDto me(Authentication auth) {
        String username = auth.getName();
        Member m = memberRepository.findByUsername(username).orElseThrow();
        return MemberDto.from(m);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public MemberDto get(@PathVariable Long id, Authentication auth) {
        Member m = memberRepository.findById(id).orElseThrow();
        assertOwnerOrAdmin(m, auth);
        return MemberDto.from(m);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public MemberDto create(@Validated @RequestBody MemberDto dto) {
        if (memberRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        Member m = new Member();
        m.setUsername(dto.getUsername());
        m.setPassword(passwordEncoder.encode(dto.getPassword()));
        m.setName(dto.getName());
        m.setRole(dto.getRole());
        return MemberDto.from(memberRepository.save(m));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public MemberDto update(@PathVariable Long id, @Validated @RequestBody MemberDto dto, Authentication auth) {
        Member m = memberRepository.findById(id).orElseThrow();
        assertOwnerOrAdmin(m, auth);

        boolean admin = isAdmin(auth);
        m.setName(dto.getName());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            m.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (admin && dto.getRole() != null && !dto.getRole().isBlank()) {
            m.setRole(dto.getRole());
        }
        return MemberDto.from(memberRepository.save(m));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        memberRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private void assertOwnerOrAdmin(Member target, Authentication auth) {
        if (isAdmin(auth)) {
            return;
        }
        if (!target.getUsername().equals(auth.getName())) {
            throw new AccessDeniedException("Forbidden");
        }
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
