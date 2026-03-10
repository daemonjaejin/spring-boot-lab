package com.example.demo.service;

import com.example.demo.entity.Seat;
import com.example.demo.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {
    private final SeatRepository seatRepository;

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    @Lazy
    private final RedissonClient redissonClient;

    @Transactional
    public void reserveSeat(Long seatId, String userId) {
        String lockKey = "lock:seat:" + seatId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // Wait for 2 seconds, Lease for 10 seconds
            if (!lock.tryLock(2, 10, TimeUnit.SECONDS)) {
                throw new IllegalStateException("Could not acquire lock for seat " + seatId);
            }

            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new IllegalArgumentException("Seat not found"));
            
            log.info("Attempting to reserve seat {} for user {}", seatId, userId);
            seat.reserve();
            seatRepository.save(seat);
            log.info("Seat {} successfully reserved for user {}", seatId, userId);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Reservation interrupted", e);
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Transactional
    public void completePayment(Long seatId, String userId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new IllegalArgumentException("Seat not found"));
        
        if (seat.getStatus() != Seat.SeatStatus.RESERVED) {
            throw new IllegalStateException("Seat is not in reserved state");
        }

        seat.setStatus(Seat.SeatStatus.SOLD);
        seatRepository.save(seat);
        log.info("Payment completed for seat {} by user {}", seatId, userId);
    }
}
