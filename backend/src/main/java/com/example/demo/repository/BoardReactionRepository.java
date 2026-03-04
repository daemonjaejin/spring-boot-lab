package com.example.demo.repository;

import com.example.demo.entity.Board;
import com.example.demo.entity.BoardReaction;
import com.example.demo.entity.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoardReactionRepository extends JpaRepository<BoardReaction, Long> {
    Optional<BoardReaction> findByBoardAndUsername(Board board, String username);
    long countByBoardAndReactionType(Board board, ReactionType reactionType);
}
