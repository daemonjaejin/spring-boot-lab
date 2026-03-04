package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "comment_reactions", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"comment_id", "username"}))
public class CommentReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    private String username;

    @Enumerated(EnumType.STRING)
    private ReactionType reactionType;

    public CommentReaction(Comment comment, String username, ReactionType reactionType) {
        this.comment = comment;
        this.username = username;
        this.reactionType = reactionType;
    }
}
