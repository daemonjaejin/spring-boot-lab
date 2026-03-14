package com.example.demo.service;

import com.example.demo.dto.BoardDto;
import com.example.demo.entity.Board;
import com.example.demo.entity.Comment;
import com.example.demo.entity.ReactionType;
import com.example.demo.repository.BoardRepository;
import com.example.demo.repository.BoardReactionRepository;
import com.example.demo.repository.CommentReactionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardReactionRepository boardReactionRepository;
    private final CommentReactionRepository commentReactionRepository;

    @Transactional(readOnly = true)
    public Page<BoardDto> getAllBoards(Pageable pageable) {
        return boardRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(BoardDto::new);
    }

    @Transactional(readOnly = true)
    public BoardDto getBoard(Long id, String username) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found"));
        
        long likes = boardReactionRepository.countByBoardAndReactionType(board, ReactionType.LIKE);
        long dislikes = boardReactionRepository.countByBoardAndReactionType(board, ReactionType.DISLIKE);
        ReactionType myReaction = null;
        if (username != null) {
            myReaction = boardReactionRepository.findByBoardAndUsername(board, username)
                    .map(com.example.demo.entity.BoardReaction::getReactionType)
                    .orElse(null);
        }

        BoardDto dto = new BoardDto(board, likes, dislikes, myReaction);
        
        // Populate comment reactions as well
        if (dto.getComments() != null) {
            populateCommentDtoReactions(board.getComments(), dto.getComments(), username);
        }

        return dto;
    }

    private void populateCommentDtoReactions(List<Comment> entities, List<com.example.demo.dto.CommentDto> dtos, String username) {
        if (dtos == null || entities == null) return;

        for (com.example.demo.dto.CommentDto dto : dtos) {
            Comment entity = entities.stream()
                    .filter(e -> e.getId().equals(dto.getId()))
                    .findFirst()
                    .orElse(null);

            if (entity != null) {
                dto.setLikeCount(commentReactionRepository.countByCommentAndReactionType(entity, ReactionType.LIKE));
                dto.setDislikeCount(commentReactionRepository.countByCommentAndReactionType(entity, ReactionType.DISLIKE));
                if (username != null) {
                    dto.setMyReaction(commentReactionRepository.findByCommentAndUsername(entity, username)
                            .map(com.example.demo.entity.CommentReaction::getReactionType)
                            .orElse(null));
                }
                
                if (dto.getChildren() != null && entity.getChildren() != null) {
                    populateCommentDtoReactions(entity.getChildren(), dto.getChildren(), username);
                }
            }
        }
    }

    @Transactional
    public Board createBoard(String title, String content, String author) {
        Board board = new Board(title, content, author);
        return boardRepository.save(board);
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream downloadExcel() throws IOException {
        List<Board> boards = boardRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Boards");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Title", "Author", "Created At", "Comment Count"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(getHeaderCellStyle(workbook));
            }

            // Data
            int rowIdx = 1;
            for (Board board : boards) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(board.getId());
                row.createCell(1).setCellValue(board.getTitle());
                row.createCell(2).setCellValue(board.getAuthor());
                row.createCell(3).setCellValue(board.getCreatedAt().toString());
                row.createCell(4).setCellValue(board.getComments().size());
            }

            for(int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    @Transactional
    public Board updateBoard(Long id, String title, String content, String username) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found"));
        
        if (!board.getAuthor().equals(username)) {
            throw new IllegalStateException("Permission denied");
        }
        
        board.setTitle(title);
        board.setContent(content);
        return boardRepository.save(board);
    }

    @Transactional
    public void deleteBoard(Long id, String username) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found"));
        
        if (!board.getAuthor().equals(username)) {
            throw new IllegalStateException("Permission denied");
        }
        
        boardRepository.delete(board);
    }

    private CellStyle getHeaderCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }
}
