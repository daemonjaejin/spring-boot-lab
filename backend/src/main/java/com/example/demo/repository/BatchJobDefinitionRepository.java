package com.example.demo.repository;

import com.example.demo.entity.BatchJobDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BatchJobDefinitionRepository extends JpaRepository<BatchJobDefinition, Long> {
    Optional<BatchJobDefinition> findByJobKey(String jobKey);

    boolean existsByJobKey(String jobKey);

    boolean existsByJobKeyAndIdNot(String jobKey, Long id);

    List<BatchJobDefinition> findAllByEnabledTrue();
}

