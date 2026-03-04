package com.example.demo.controller;

import com.example.demo.entity.ReactionType;
import com.example.demo.service.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final ReactionService reactionService;
    private final com.example.demo.service.CommentService commentService;

    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody com.example.demo.dto.CommentDto dto, Authentication authentication) {
        String author = authentication != null ? authentication.getName() : "Anonymous";
        return ResponseEntity.ok(commentService.createComment(dto.getBoardId(), dto.getParentId(), dto.getContent(), author));
    }

    @PostMapping("/{id}/reaction")
    public ResponseEntity<?> toggleReaction(
            @PathVariable Long id,
            @RequestParam ReactionType type,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        reactionService.toggleCommentReaction(id, authentication.getName(), type);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        commentService.deleteComment(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
