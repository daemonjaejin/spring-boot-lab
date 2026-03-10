package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "seats")
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rowNum;
    private Integer colNum;
    private Integer price;

    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    @Version
    private Long version;

    public enum SeatStatus {
        AVAILABLE, RESERVED, SOLD
    }

    public void reserve() {
        if (this.status != SeatStatus.AVAILABLE) {
            throw new IllegalStateException("Seat is not available");
        }
        this.status = SeatStatus.RESERVED;
    }
}
