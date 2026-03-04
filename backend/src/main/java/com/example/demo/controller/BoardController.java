package com.example.demo.controller;

import com.example.demo.dto.BoardDto;
import com.example.demo.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final com.example.demo.service.ReactionService reactionService;

    @GetMapping
    public Page<BoardDto> getAllBoards(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return boardService.getAllBoards(pageable);
    }

    @GetMapping("/{id}")
    public BoardDto getBoard(@PathVariable Long id, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return boardService.getBoard(id, username);
    }

    @PostMapping
    public ResponseEntity<?> createBoard(@RequestBody BoardDto dto, Authentication authentication) {
        String author = authentication != null ? authentication.getName() : "Anonymous";
        return ResponseEntity.ok(boardService.createBoard(dto.getTitle(), dto.getContent(), author));
    }

    @PostMapping("/{id}/reaction")
    public ResponseEntity<?> toggleReaction(
            @PathVariable Long id,
            @RequestParam com.example.demo.entity.ReactionType type,
            Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        reactionService.toggleBoardReaction(id, authentication.getName(), type);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBoard(@PathVariable Long id, @RequestBody BoardDto dto, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(boardService.updateBoard(id, dto.getTitle(), dto.getContent(), authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBoard(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        boardService.deleteBoard(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/excel")
    public ResponseEntity<InputStreamResource> downloadExcel() throws IOException {
        ByteArrayInputStream in = boardService.downloadExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=boards.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(in));
    }
}
