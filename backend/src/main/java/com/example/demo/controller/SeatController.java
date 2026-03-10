package com.example.demo.controller;

import com.example.demo.entity.Seat;
import com.example.demo.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ticketing/seats")
@RequiredArgsConstructor
public class SeatController {
    private final ReservationService reservationService;

    @GetMapping
    public List<Seat> getSeats() {
        return reservationService.getAllSeats();
    }

    @PostMapping("/{seatId}/reserve")
    public void reserve(@PathVariable Long seatId, @RequestBody Map<String, String> payload) {
        reservationService.reserveSeat(seatId, payload.get("userId"));
    }

    @PostMapping("/{seatId}/payment")
    public void pay(@PathVariable Long seatId, @RequestBody Map<String, String> payload) {
        reservationService.completePayment(seatId, payload.get("userId"));
    }
}
