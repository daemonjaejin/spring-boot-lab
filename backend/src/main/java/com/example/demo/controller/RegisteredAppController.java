package com.example.demo.controller;

import com.example.demo.entity.RegisteredApp;
import com.example.demo.repository.RegisteredAppRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apps")
@RequiredArgsConstructor
public class RegisteredAppController {
    private final RegisteredAppRepository repo;

    @GetMapping
    public List<RegisteredApp> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public RegisteredApp get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public RegisteredApp create(@RequestBody RegisteredApp app) {
        return repo.save(app);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public RegisteredApp update(@PathVariable Long id, @RequestBody RegisteredApp app) {
        RegisteredApp ex = repo.findById(id).orElseThrow();
        ex.setName(app.getName());
        ex.setDescription(app.getDescription());
        ex.setVersion(app.getVersion());
        return repo.save(ex);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
