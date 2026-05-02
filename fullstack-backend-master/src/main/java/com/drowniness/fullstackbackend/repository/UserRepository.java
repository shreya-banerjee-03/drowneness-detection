package com.drowniness.fullstackbackend.repository;

import com.drowniness.fullstackbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,String> {

    @Query(
            value = "Select * FROM users " +
                    "WHERE product_key = :productKey " +
                    "AND is_verified = true " +
                    "AND is_expired = false"
            , nativeQuery = true
    )
    Optional<User> findByProductKey(
        @Param("productKey") String productKey
    );

    @Query(
            value = "SELECT * FROM users " +
                    "WHERE NOW() > expired_on " +
                    "AND is_expired = false"
            , nativeQuery = true
    )
    List<User> findAllExpired();

}
