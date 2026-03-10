package com.example.demo.init;

import com.example.demo.entity.Seat;
import com.example.demo.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final SeatRepository seatRepository;

    @Override
    public void run(String... args) throws Exception {
        if (seatRepository.count() == 0) {
            for (int r = 1; r <= 5; r++) {
                String row = String.valueOf((char)('A' + r - 1));
                for (int c = 1; c <= 10; c++) {
                    seatRepository.save(Seat.builder()
                            .rowNum(row)
                            .colNum(c)
                            .price(150000)
                            .status(Seat.SeatStatus.AVAILABLE)
                            .build());
                }
            }
        }
    }
}
