package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final BoardReactionRepository boardReactionRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public void toggleBoardReaction(Long boardId, String username, ReactionType type) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found"));

        boardReactionRepository.findByBoardAndUsername(board, username)
                .ifPresentOrElse(reaction -> {
                    if (reaction.getReactionType() == type) {
                        // Same reaction: cancel it
                        boardReactionRepository.delete(reaction);
                    } else {
                        // Different reaction: update it
                        reaction.setReactionType(type);
                        boardReactionRepository.save(reaction);
                    }
                }, () -> {
                    // New reaction
                    boardReactionRepository.save(new BoardReaction(board, username, type));
                });
    }

    @Transactional
    public void toggleCommentReaction(Long commentId, String username, ReactionType type) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        commentReactionRepository.findByCommentAndUsername(comment, username)
                .ifPresentOrElse(reaction -> {
                    if (reaction.getReactionType() == type) {
                        // Same reaction: cancel it
                        commentReactionRepository.delete(reaction);
                    } else {
                        // Different reaction: update it
                        reaction.setReactionType(type);
                        commentReactionRepository.save(reaction);
                    }
                }, () -> {
                    // New reaction
                    commentReactionRepository.save(new CommentReaction(comment, username, type));
                });
    }
}
