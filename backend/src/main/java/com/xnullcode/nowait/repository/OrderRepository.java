package com.xnullcode.nowait.repository;

import com.xnullcode.nowait.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOwnerIdOrderByTimestampDesc(Long ownerId);
}
