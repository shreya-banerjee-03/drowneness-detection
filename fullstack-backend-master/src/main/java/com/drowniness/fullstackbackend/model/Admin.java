package com.drowniness.fullstackbackend.model;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "admin")
public class Admin {
    @Id
    private String id = UUID.randomUUID().toString();
    @Column(nullable = false)
    private String fullName;
    @Column(nullable = false)
    private String email;
    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private ZonedDateTime createdDate = ZonedDateTime.now();
    private String otp;
    private ZonedDateTime otpSendTimeStamp = ZonedDateTime.now();
}