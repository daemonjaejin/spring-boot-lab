package com.example.demo.repository;

import com.example.demo.entity.Comment;
import com.example.demo.entity.CommentReaction;
import com.example.demo.entity.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {
    Optional<CommentReaction> findByCommentAndUsername(Comment comment, String username);
    long countByCommentAndReactionType(Comment comment, ReactionType reactionType);
}
