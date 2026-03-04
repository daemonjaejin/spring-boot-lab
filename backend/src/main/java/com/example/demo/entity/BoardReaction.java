package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "board_reactions", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"board_id", "username"}))
public class BoardReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

    private String username;

    @Enumerated(EnumType.STRING)
    private ReactionType reactionType;

    public BoardReaction(Board board, String username, ReactionType reactionType) {
        this.board = board;
        this.username = username;
        this.reactionType = reactionType;
    }
}
