package com.example.demo.service;

import com.example.demo.dto.CommentDto;
import com.example.demo.entity.Board;
import com.example.demo.entity.Comment;
import com.example.demo.repository.BoardRepository;
import com.example.demo.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;

    @Transactional
    public CommentDto createComment(Long boardId, Long parentId, String content, String author) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found"));

        Comment comment = new Comment(content, author, board);

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
            comment.setParent(parent);
            comment.setBoard(parent.getBoard()); // Ensure same board
        }

        Comment saved = commentRepository.save(comment);
        return new CommentDto(saved); // Ideally should return full structure but simple DTO is enough for response
    }

    @Transactional
    public void deleteComment(Long id, String username) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        
        if (!comment.getAuthor().equals(username)) {
            throw new IllegalStateException("Permission denied");
        }
        
        commentRepository.delete(comment);
    }
}
