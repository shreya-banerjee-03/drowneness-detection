package com.drowniness.fullstackbackend.repository;

import com.drowniness.fullstackbackend.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin,String> {

    @Query(
            value = "SELECT * FROM admin WHERE email = :email",
            nativeQuery = true
    )
    Optional<Admin> findByEmailId(
            @Param("email") String email
    );

}
