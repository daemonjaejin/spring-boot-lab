package com.example.demo.dto;

import com.example.demo.entity.Board;
import com.example.demo.entity.ReactionType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
public class BoardDto {
    private Long id;
    private String title;
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentDto> comments;
    private int commentCount;
    private long likeCount;
    private long dislikeCount;
    private ReactionType myReaction;

    public BoardDto(Board board) {
        this(board, 0, 0, null);
    }

    public BoardDto(Board board, long likeCount, long dislikeCount, ReactionType myReaction) {
        this.id = board.getId();
        this.title = board.getTitle();
        this.content = board.getContent();
        this.author = board.getAuthor();
        this.createdAt = board.getCreatedAt();
        this.updatedAt = board.getUpdatedAt();
        this.likeCount = likeCount;
        this.dislikeCount = dislikeCount;
        this.myReaction = myReaction;
        if (board.getComments() != null) {
            this.commentCount = board.getComments().size();
            // Root comments only (comments with no parent)
            this.comments = board.getComments().stream()
                    .filter(c -> c.getParent() == null)
                    .map(c -> new CommentDto(c)) // Simple mapping, nested counts handled separately if needed
                    .collect(Collectors.toList());
        }
    }
}
