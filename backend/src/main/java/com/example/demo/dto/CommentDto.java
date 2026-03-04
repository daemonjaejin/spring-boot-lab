package com.example.demo.dto;

import com.example.demo.entity.Comment;
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
public class CommentDto {
    private Long id;
    private Long boardId;
    private Long parentId;
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentDto> children;
    private long likeCount;
    private long dislikeCount;
    private ReactionType myReaction;

    public CommentDto(Comment comment) {
        this(comment, 0, 0, null);
    }

    public CommentDto(Comment comment, long likeCount, long dislikeCount, ReactionType myReaction) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.author = comment.getAuthor();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
        this.parentId = comment.getParent() != null ? comment.getParent().getId() : null;
        this.likeCount = likeCount;
        this.dislikeCount = dislikeCount;
        this.myReaction = myReaction;
        if (comment.getChildren() != null) {
            this.children = comment.getChildren().stream()
                    .map(c -> new CommentDto(c))
                    .collect(Collectors.toList());
        }
    }
}
