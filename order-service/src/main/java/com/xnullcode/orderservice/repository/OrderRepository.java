package com.xnullcode.orderservice.repository;

import com.xnullcode.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOwnerIdOrderByTimestampDesc(Long ownerId);

    @Query("SELECT COALESCE(MAX(o.orderNumber), 0) FROM Order o WHERE o.ownerId = :ownerId")
    Long findMaxOrderNumberByOwnerId(@Param("ownerId") Long ownerId);
}
